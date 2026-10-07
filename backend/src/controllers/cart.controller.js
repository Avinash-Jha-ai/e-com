import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";



const calculateCartTotal = (cart) => {
    return cart.items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
};




export const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

        // Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
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

        // Get current product price
        const price =
            product.salePrice > 0
                ? product.salePrice
                : product.regularPrice;

        // Find or create cart
        let cart = await cartModel.findOne({
            user: userId
        });

        if (!cart) {
            cart = await cartModel.create({
                user: userId,
                items: []
            });
        }

        // Check if product already exists
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + quantity;

            if (newQuantity > stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available. You already have ${existingItem.quantity} in your cart`
                });
            }

            existingItem.quantity = newQuantity;

            // Update price in case product price changed
            existingItem.price = price;
        }

        

        else {

            if (quantity > stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available`
                });
            }

            cart.items.push({
                product: productId,
                quantity,
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

        const userId = req.user._id;

        let cart = await cartModel
            .findOne({ user: userId })
            .populate("items.product");

        // Create empty cart if user doesn't have one
        if (!cart) {
            cart = await cartModel.create({
                user: userId,
                items: []
            });
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

        const userId = req.user._id;
        const { productId } = req.params;

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

        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        // Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
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
        if (quantity > stock) {
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
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        // Update quantity
        item.quantity = quantity;

        // Update latest price
        item.price =
            product.salePrice > 0
                ? product.salePrice
                : product.regularPrice;

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

        const userId = req.user._id;

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