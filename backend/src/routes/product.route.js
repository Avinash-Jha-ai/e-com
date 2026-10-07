import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";

import {
    uploadProduct,
    updateProduct,
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

// Storefront Public Product APIs
router.get("/products", getAllProduct);
router.get("/product/search", searchProduct);
router.get("/search", searchProduct);
router.get("/product/:id", getProductDetails);

// Admin / Single Seller Product Management APIs
router.post(
    "/seller/createProduct",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    upload.array("images", 10),
    uploadProduct
);

router.put(
    "/seller/update/:id",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    upload.array("images", 10),
    updateProduct
);

router.get(
    "/seller/products",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    getSellerProduct
);

router.delete(
    "/seller/delete/:id",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    deleteProduct
);

router.post(
    "/seller/ai/product",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    upload.array("images", 10),
    generateProductAI
);

export default router;