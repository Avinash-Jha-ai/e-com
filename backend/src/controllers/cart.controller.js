import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

const calculateCartTotal = (cart) => {
    return (cart.items || []).reduce((total, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 1;
        return total + itemPrice * itemQuantity;
    }, 0);
};

export const addToCart = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

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

        const parsedQuantity = parseInt(quantity, 10);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        // Find product
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const stock = product.stock || 0;

        if (stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        // Get current product price with proper fallback to product.price
        const price =
            product.salePrice > 0
                ? product.salePrice
                : (product.price ?? product.regularPrice ?? 0);

        // Find or create cart
        let cart = await cartModel.findOne({
            user: userId
        });

        if (!cart) {
            cart = await cartModel.create({
                user: userId,
                items: [],
                totalPrice: 0
            });
        }

        // Check if product already exists
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + parsedQuantity;

            if (newQuantity > stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available. You already have ${existingItem.quantity} in your cart`
                });
            }

            existingItem.quantity = newQuantity;
            existingItem.price = price;
        } else {
            if (parsedQuantity > stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available`
                });
            }

            cart.items.push({
                product: productId,
                quantity: parsedQuantity,
                price
            });
        }

        // Calculate total
        cart.totalPrice = calculateCartTotal(cart);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        let cart = await cartModel
            .findOne({ user: userId })
            .populate("items.product");

        // Create empty cart if user doesn't have one
        if (!cart) {
            cart = await cartModel.create({
                user: userId,
                items: [],
                totalPrice: 0
            });
        } else {
            // Clean up any items whose product has been deleted from DB
            const validItems = cart.items.filter(item => item.product !== null);
            if (validItems.length !== cart.items.length) {
                cart.items = validItems;
                cart.totalPrice = calculateCartTotal(cart);
                await cart.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { productId } = req.params;

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

        const cart = await cartModel.findOne({
            user: userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemExists = cart.items.some(
            item => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        // Recalculate total
        cart.totalPrice = calculateCartTotal(cart);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart
        });

    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { productId } = req.params;
        const { quantity } = req.body;

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

        const parsedQuantity = parseInt(quantity, 10);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // Find product
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const stock = product.stock || 0;

        // Check stock
        if (parsedQuantity > stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${stock} items available`
            });
        }

        // Find cart
        const cart = await cartModel.findOne({
            user: userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find item
        const item = cart.items.find(
            it => it.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        // Update quantity
        item.quantity = parsedQuantity;

        // Update latest price
        item.price =
            product.salePrice > 0
                ? product.salePrice
                : (product.price ?? product.regularPrice ?? 0);

        // Recalculate total
        cart.totalPrice = calculateCartTotal(cart);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart
        });

    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const cart = await cartModel.findOne({
            user: userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};