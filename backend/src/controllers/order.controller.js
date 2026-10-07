import mongoose from "mongoose";

import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";


// =====================================================
// CREATE ORDER
// =====================================================

export const createOrder = async (req, res, next) => {

    try {

        // ---------------------------------------------
        // GET USER ID
        // ---------------------------------------------

        const userId =
            req.userId || req.user?._id;


        if (!userId) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }


        // ---------------------------------------------
        // REQUEST BODY
        // ---------------------------------------------

        const {
            addressId,
            paymentMethod = "COD"
        } = req.body;


        // ---------------------------------------------
        // VALIDATE PAYMENT METHOD
        // ---------------------------------------------

        if (
            !["COD", "ONLINE"].includes(paymentMethod)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });

        }


        // ---------------------------------------------
        // VALIDATE ADDRESS ID
        // ---------------------------------------------

        if (
            !addressId ||
            !mongoose.Types.ObjectId.isValid(addressId)
        ) {

            return res.status(400).json({
                success: false,
                message: "A valid address ID is required"
            });

        }


        // ---------------------------------------------
        // FIND CART
        // ---------------------------------------------

        const cart =
            await cartModel
                .findOne({
                    user: userId
                })
                .populate("items.product");


        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });

        }


        if (
            !cart.items ||
            cart.items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });

        }


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

        const user =
            await userModel.findById(userId);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // ---------------------------------------------
        // FIND ADDRESS
        // ---------------------------------------------

        const address =
            user.addresses.id(addressId);


        if (!address) {

            return res.status(404).json({
                success: false,
                message: "Address not found"
            });

        }


        // ---------------------------------------------
        // CHECK STOCK
        // ---------------------------------------------

        for (
            const item of cart.items
        ) {

            const product =
                item.product;


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "A product in your cart is no longer available"
                });

            }


            if (
                product.stock < item.quantity
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `${product.title} has only ${product.stock} items available`
                });

            }

        }


        // ---------------------------------------------
        // PREPARE ORDER ITEMS
        // ---------------------------------------------

        const orderItems =
            cart.items.map((item) => {

                return {

                    product:
                        item.product._id,

                    quantity:
                        item.quantity,

                    price:
                        item.price

                };

            });


        // ---------------------------------------------
        // INITIAL TRACKING STATUS
        // ---------------------------------------------

        const initialStatus =
            paymentMethod === "COD"
                ? "CONFIRMED"
                : "PENDING";


        const initialMessage =
            paymentMethod === "COD"
                ? "Order confirmed"
                : "Order placed and waiting for payment";


        // ---------------------------------------------
        // CREATE ORDER
        // ---------------------------------------------

        const order =
            await orderModel.create({

                user: userId,

                items: orderItems,

                totalPrice:
                    cart.totalPrice,

                shippingAddress: {

                    fullName:
                        address.fullName,

                    phone:
                        address.phone,

                    addressLine1:
                        address.addressLine1,

                    addressLine2:
                        address.addressLine2 || "",

                    city:
                        address.city,

                    state:
                        address.state,

                    postalCode:
                        address.postalCode,

                    country:
                        address.country || "India"

                },

                paymentMethod:

                    paymentMethod,

                paymentStatus:
                    "PENDING",

                orderStatus:
                    initialStatus,

                tracking: [

                    {

                        status:
                            initialStatus,

                        message:
                            initialMessage,

                        date:
                            new Date()

                    }

                ]

            });


        // ---------------------------------------------
        // COD
        // ---------------------------------------------

        if (
            paymentMethod === "COD"
        ) {

            // Reduce stock

            for (
                const item of cart.items
            ) {

                const updatedProduct =
                    await productModel.findOneAndUpdate(

                        {
                            _id:
                                item.product._id,

                            stock: {
                                $gte:
                                    item.quantity
                            }
                        },

                        {
                            $inc: {
                                stock:
                                    -item.quantity
                            }
                        },

                        {
                            new: true
                        }

                    );


                if (!updatedProduct) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `Insufficient stock for ${item.product.title}`

                    });

                }

            }


            // Clear cart

            cart.items = [];

            cart.totalPrice = 0;

            await cart.save();

        }


        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                paymentMethod === "COD"
                    ? "Order placed successfully"
                    : "Order created. Proceed to payment",

            order

        });


    } catch (error) {

        next(error);

    }

};


// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrders = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.userId || req.user?._id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        const orders =
            await orderModel

                .find({
                    user: userId
                })

                .populate(
                    "items.product",
                    "title price images"
                )

                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            orders

        });


    } catch (error) {

        next(error);

    }

};


// =====================================================
// GET SINGLE ORDER
// =====================================================

export const getOrderById = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.userId || req.user?._id;


        const {
            orderId
        } = req.params;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID"

            });

        }


        const order =
            await orderModel

                .findOne({

                    _id:
                        orderId,

                    user:
                        userId

                })

                .populate(
                    "items.product",
                    "title price images"
                );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        return res.status(200).json({

            success: true,

            order

        });


    } catch (error) {

        next(error);

    }

};


// =====================================================
// TRACK ORDER
// =====================================================

export const trackOrder = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.userId || req.user?._id;


        const {
            orderId
        } = req.params;


        // ---------------------------------------------
        // AUTH CHECK
        // ---------------------------------------------

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // ---------------------------------------------
        // VALIDATE ORDER ID
        // ---------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID"

            });

        }


        // ---------------------------------------------
        // FIND USER'S ORDER
        // ---------------------------------------------

        const order =
            await orderModel.findOne({

                _id:
                    orderId,

                user:
                    userId

            });


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // ---------------------------------------------
        // RETURN TRACKING
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            orderId:
                order._id,

            orderStatus:
                order.orderStatus,

            paymentStatus:
                order.paymentStatus,

            tracking:
                order.tracking

        });


    } catch (error) {

        next(error);

    }

};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateOrderStatus = async (
    req,
    res,
    next
) => {

    try {

        const {
            orderId
        } = req.params;


        const {
            status
        } = req.body;


        // ---------------------------------------------
        // VALIDATE ORDER ID
        // ---------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID"

            });

        }


        // ---------------------------------------------
        // VALID STATUSES
        // ---------------------------------------------

        const allowedStatus = [

            "PENDING",

            "CONFIRMED",

            "SHIPPED",

            "DELIVERED",

            "CANCELLED"

        ];


        if (
            !allowedStatus.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status"

            });

        }


        // ---------------------------------------------
        // FIND ORDER
        // ---------------------------------------------

        const order =
            await orderModel.findById(
                orderId
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // ---------------------------------------------
        // PREVENT UPDATE AFTER FINAL STATUS
        // ---------------------------------------------

        if (
            order.orderStatus ===
                "DELIVERED" ||

            order.orderStatus ===
                "CANCELLED"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Order status cannot be changed"

            });

        }


        // ---------------------------------------------
        // STATUS MESSAGE
        // ---------------------------------------------

        let message;


        switch (status) {

            case "PENDING":

                message =
                    "Order is pending";

                break;


            case "CONFIRMED":

                message =
                    "Order has been confirmed";

                break;


            case "SHIPPED":

                message =
                    "Order has been shipped";

                break;


            case "DELIVERED":

                message =
                    "Order has been delivered";

                break;


            case "CANCELLED":

                message =
                    "Order has been cancelled";

                break;


            default:

                message =
                    "Order status updated";

        }


        // ---------------------------------------------
        // RESTORE STOCK IF CANCELLED
        // ---------------------------------------------

        if (status === "CANCELLED") {
            const stockWasDeducted =
                order.paymentMethod === "COD" ||
                order.paymentStatus === "PAID";

            if (stockWasDeducted) {
                for (const item of order.items) {
                    await productModel.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity }
                    });
                }
            }
        }

        // ---------------------------------------------
        // UPDATE STATUS
        // ---------------------------------------------

        order.orderStatus =
            status;


        // ---------------------------------------------
        // ADD TRACKING HISTORY
        // ---------------------------------------------

        order.tracking.push({

            status:
                status,

            message:
                message,

            date:
                new Date()

        });


        await order.save();


        return res.status(200).json({

            success: true,

            message:
                "Order status updated successfully",

            order

        });


    } catch (error) {

        next(error);

    }

};


// =====================================================
// CANCEL ORDER
// =====================================================

export const cancelOrder = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.userId || req.user?._id;


        const {
            orderId
        } = req.params;


        // ---------------------------------------------
        // AUTH CHECK
        // ---------------------------------------------

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // ---------------------------------------------
        // VALIDATE ORDER ID
        // ---------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID"

            });

        }


        // ---------------------------------------------
        // FIND ORDER
        // ---------------------------------------------

        const order =
            await orderModel.findOne({

                _id:
                    orderId,

                user:
                    userId

            });


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // ---------------------------------------------
        // CHECK STATUS
        // ---------------------------------------------

        if (

            order.orderStatus ===
                "SHIPPED" ||

            order.orderStatus ===
                "DELIVERED" ||

            order.orderStatus ===
                "CANCELLED"

        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}`

            });

        }


        // ---------------------------------------------
        // CHECK WHETHER STOCK WAS DEDUCTED
        // ---------------------------------------------

        const stockWasDeducted =

            order.paymentMethod ===
                "COD"

            ||

            order.paymentStatus ===
                "PAID";


        // ---------------------------------------------
        // RESTORE STOCK
        // ---------------------------------------------

        if (stockWasDeducted) {

            for (
                const item of order.items
            ) {

                await productModel
                    .findByIdAndUpdate(

                        item.product,

                        {

                            $inc: {

                                stock:
                                    item.quantity

                            }

                        }

                    );

            }

        }


        // ---------------------------------------------
        // UPDATE ORDER
        // ---------------------------------------------

        order.orderStatus =
            "CANCELLED";


        // ---------------------------------------------
        // ADD TRACKING
        // ---------------------------------------------

        order.tracking.push({

            status:
                "CANCELLED",

            message:
                "Order has been cancelled",

            date:
                new Date()

        });


        await order.save();


        return res.status(200).json({

            success: true,

            message:
                "Order cancelled successfully",

            order

        });


    } catch (error) {

        next(error);

    }

};