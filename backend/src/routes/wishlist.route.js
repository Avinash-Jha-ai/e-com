import { Router } from "express";

import {
    addProductToWishlist,
    removeProductFromWishlist,
    getWishlist
} from "../controllers/wishlist.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
    "/",
    isAuthenticated,
    getWishlist
);

router.post(
    "/add/product/:id",
    isAuthenticated,
    addProductToWishlist
);

router.delete(
    "/delete/product/:id",
    isAuthenticated,
    removeProductFromWishlist
);

export default router;