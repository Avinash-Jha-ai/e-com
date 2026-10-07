import mongoose from "mongoose";
import wishlistModel from "../models/wishlist.model.js";
import productModel from "../models/product.model.js";

export const addProductToWishlist = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const productId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let wishlist = await wishlistModel.findOne({
            user: userId
        });

        if (!wishlist) {
            wishlist = await wishlistModel.create({
                user: userId,
                products: [productId]
            });
        } else {
            const alreadyExists = wishlist.products.some(
                id => id.toString() === productId
            );

            if (!alreadyExists) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};


export const removeProductFromWishlist = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const productId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = await wishlistModel.findOne({
            user: userId
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        );

        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            wishlist
        });

    } catch (error) {
        console.error("Remove from wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};


export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        let wishlist = await wishlistModel
            .findOne({
                user: userId
            })
            .populate("products");

        if (!wishlist) {
            wishlist = {
                user: userId,
                products: []
            };
        }

        return res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            wishlist
        });

    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};