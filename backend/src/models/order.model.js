import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        // =========================================
        // USER
        // =========================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // =========================================
        // ORDER ITEMS
        // =========================================

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        // =========================================
        // TOTAL PRICE
        // =========================================

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        // =========================================
        // SHIPPING ADDRESS
        // =========================================

        shippingAddress: {
            fullName: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            addressLine1: {
                type: String,
                required: true,
                trim: true
            },

            addressLine2: {
                type: String,
                default: "",
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            state: {
                type: String,
                required: true,
                trim: true
            },

            postalCode: {
                type: String,
                required: true,
                trim: true
            },

            country: {
                type: String,
                default: "India",
                trim: true
            }
        },

        // =========================================
        // PAYMENT
        // =========================================

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD"
        },

        paymentStatus: {
            type: String,
            enum: [
                "PENDING",
                "PAID",
                "FAILED"
            ],
            default: "PENDING"
        },

        // =========================================
        // RAZORPAY
        // =========================================

        razorpayOrderId: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        razorpaySignature: {
            type: String,
            default: null
        },

        // =========================================
        // CURRENT ORDER STATUS
        // =========================================

        orderStatus: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED"
            ],
            default: "PENDING",
            index: true
        },

        // =========================================
        // ORDER TRACKING HISTORY
        // =========================================

        tracking: [
            {
                status: {
                    type: String,
                    enum: [
                        "PENDING",
                        "CONFIRMED",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED"
                    ],
                    required: true
                },

                message: {
                    type: String,
                    required: true,
                    trim: true
                },

                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const orderModel = mongoose.model(
    "order",
    orderSchema
);

export default orderModel;