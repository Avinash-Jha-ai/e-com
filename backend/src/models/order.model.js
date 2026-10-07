import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

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

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        shippingAddress: {
            fullName: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                required: true
            },

            addressLine1: {
                type: String,
                required: true
            },

            addressLine2: {
                type: String,
                default: ""
            },

            city: {
                type: String,
                required: true
            },

            state: {
                type: String,
                required: true
            },

            postalCode: {
                type: String,
                required: true
            },

            country: {
                type: String,
                default: "India"
            }
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD"
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING"
        },

        orderStatus: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED"
            ],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;