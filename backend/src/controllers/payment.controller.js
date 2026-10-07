import crypto from "crypto";

import razorpay from "../configs/razorpay.js";

import orderModel from "../models/order.model.js";

import cartModel from "../models/cart.model.js";

import productModel from "../models/product.model.js";


export const createPaymentOrder = async (req, res, next) => {

    try {

        const userId = req.user._id;

        const { orderId } = req.body;


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


        const amount = Math.round(
            order.totalPrice * 100
        );


        const razorpayOrder =
            await razorpay.orders.create({

                amount: amount,

                currency: "INR",

                receipt: order._id.toString(),

                notes: {
                    orderId: order._id.toString(),
                    userId: userId.toString()
                }

            });


        
        order.razorpayOrderId =
            razorpayOrder.id;


        await order.save();


        return res.status(200).json({

            success: true,

            message: "Payment order created",

            key: process.env.RAZORPAY_KEY_ID,

            razorpayOrderId:
                razorpayOrder.id,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency,

            orderId:
                order._id

        });

    } catch (error) {

        next(error);

    }

};




export const verifyPayment = async (req, res, next) => {

    try {

        const userId = req.user._id;


        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


       
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message: "Payment details are required"

            });

        }


     
        const order = await orderModel.findOne({

            user: userId,

            razorpayOrderId:
                razorpay_order_id

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


        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;


        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");


        if (
            expectedSignature !==
            razorpay_signature
        ) {

            order.paymentStatus = "FAILED";

            await order.save();


            return res.status(400).json({

                success: false,

                message: "Payment verification failed"

            });

        }


        
        order.paymentStatus = "PAID";

        order.orderStatus = "CONFIRMED";

        order.razorpayPaymentId =
            razorpay_payment_id;

        order.razorpaySignature =
            razorpay_signature;


        await order.save();


        
        for (const item of order.items) {

            const product =
                await productModel.findById(
                    item.product
                );


            if (!product) {
                continue;
            }


            product.stock -= item.quantity;


            await product.save();

        }


       
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