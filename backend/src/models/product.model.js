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

        category: {
            type: String,
            default: "everyday",
            trim: true
        },

        occasion: {
            type: String,
            enum: ["festive", "wedding", "everyday", "statement"],
            default: "everyday",
            trim: true,
            lowercase: true
        },

        fabric: {
            type: String,
            enum: ["silk", "organza", "chiffon", "georgette", "linen"],
            trim: true,
            lowercase: true
        },

        discountPrice: {
            type: Number,
            min: 0,
            default: 0
        },

        isHero: {
            type: Boolean,
            default: false
        },

        heroTagline: {
            type: String,
            default: "",
            trim: true
        },

        heroSubtitle: {
            type: String,
            default: "",
            trim: true
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        tags: [
            {
                type: String,
                trim: true
            }
        ],

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

productSchema.index({ occasion: 1, fabric: 1, stock: 1, price: 1 });
productSchema.index({ createdAt: -1 });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
if (!mongoose.models.Product) {
    mongoose.model("Product", productSchema);
}

export default productModel;
