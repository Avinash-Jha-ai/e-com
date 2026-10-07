import { Router } from "express";

import {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
} from "../controllers/cart.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();


// Add product
router.post(
    "/add/:productId",
    isAuthenticated,
    addToCart
);


// Get cart
router.get(
    "/",
    isAuthenticated,
    getCart
);


// Update quantity
router.patch(
    "/update/:productId",
    isAuthenticated,
    updateCartItemQuantity
);


// Remove product
router.delete(
    "/remove/:productId",
    isAuthenticated,
    removeFromCart
);


// Clear cart
router.delete(
    "/clear",
    isAuthenticated,
    clearCart
);

export default router;