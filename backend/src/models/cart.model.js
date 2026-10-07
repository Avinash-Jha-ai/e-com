import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
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
                    min: 1,
                    default: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                    default: 0
                }
            }
        ],

        totalPrice: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;