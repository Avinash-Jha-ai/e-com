import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";

import {
    uploadProduct,
    getAllProduct,
    getProductDetails,
    getSellerProduct,
    deleteProduct,
    searchProduct,
    generateProductAI
} from "../controllers/product.controller.js";

import {
    authorizeRoles,
    isAuthenticated
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/seller/createProduct",
    isAuthenticated,
    authorizeRoles("shopkeeper"),
    upload.array("images", 10),
    uploadProduct
);

router.get(
    "/products",
    getAllProduct
);

router.get(
    "/product/search",
    searchProduct
);

router.get(
    "/product/:id",
    getProductDetails
);

router.get(
    "/seller/products",
    isAuthenticated,
    authorizeRoles("shopkeeper"),
    getSellerProduct
);

router.delete(
    "/seller/delete/:id",
    isAuthenticated,
    authorizeRoles("shopkeeper"),
    deleteProduct
);

router.get(
    "/search",
    searchProduct
);

router.post(
    "/seller/ai/product",
    isAuthenticated,
    authorizeRoles("shopkeeper"),
    generateProductAI
);

export default router;