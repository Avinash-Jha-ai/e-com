import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../configs/razorpay.js";
import { configs } from "../configs/config.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

export const createPaymentOrder = async (req, res, next) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { orderId } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Valid order ID is required"
            });
        }

        const order = await orderModel.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.paymentMethod !== "ONLINE") {
            return res.status(400).json({
                success: false,
                message: "This order does not require online payment"
            });
        }

        if (order.paymentStatus === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Order is already paid"
            });
        }

        // Verify that products are still available in stock before creating payment
        for (const item of order.items) {
            const product = await productModel.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Item ${product?.title || "in order"} has insufficient stock`
                });
            }
        }

        const amount = Math.round(order.totalPrice * 100);

        if (Number.isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount"
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: order._id.toString(),
            notes: {
                orderId: order._id.toString(),
                userId: userId.toString()
            }
        });

        order.razorpayOrderId = razorpayOrder.id;

        await order.save();

        const keyId = configs.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

        return res.status(200).json({
            success: true,
            message: "Payment order created",
            key: keyId,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: order._id
        });

    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string" ||
            !razorpay_order_id.trim() ||
            !razorpay_payment_id.trim() ||
            !razorpay_signature.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid payment details are required"
            });
        }

        const order = await orderModel.findOne({
            user: userId,
            razorpayOrderId: razorpay_order_id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.paymentStatus === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Payment already verified"
            });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const secret = configs.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
        const receivedBuffer = Buffer.from(razorpay_signature, "utf-8");

        const isSignatureValid =
            expectedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

        if (!isSignatureValid) {
            order.paymentStatus = "FAILED";
            await order.save();

            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        order.paymentStatus = "PAID";
        order.orderStatus = "CONFIRMED";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;

        await order.save();

        // Reduce stock atomically for paid items
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        // Clear user cart
        await cartModel.findOneAndUpdate(
            {
                user: userId
            },
            {
                $set: {
                    items: [],
                    totalPrice: 0
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order
        });

    } catch (error) {
        next(error);
    }
};