import mongoose from "mongoose";
import wishlistModel from "../models/wishlist.model.js";

export const addProductToWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const productId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
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
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const removeProductFromWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const productId = req.params.id;

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
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId;

        console.log("GET USER:", userId);

        const wishlist = await wishlistModel.findOne({
            user: userId
        });

        console.log("WISHLIST FROM DB:", wishlist);

        return res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            wishlist
        });

    } catch (error) {
        console.log("GET WISHLIST ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};