import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        shortDescription: {
            type: String,
            required: true,
            trim: true
        },

        images: [
            {
                url: {
                    type: String,
                    required: true
                },

                isFront: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        price: {
            type: Number,
            required: true,
            min: 0
        },

        stock: {
            type: Number,
            default: 10,
            min: 0
        },

        sellerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
if (!mongoose.models.Product) {
    mongoose.model("Product", productSchema);
}

export default productModel;