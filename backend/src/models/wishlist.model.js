import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        }
    ]
}, { timestamps: true });

const wishlistModel = mongoose.model("wishlist", wishlistSchema);

export default wishlistModel;