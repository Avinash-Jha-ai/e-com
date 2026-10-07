import { Router } from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
} from "../controllers/order.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";


const router = Router();


// Create order
router.post(
    "/",
    isAuthenticated,
    createOrder
);


// Get all my orders
router.get(
    "/",
    isAuthenticated,
    getMyOrders
);


// Get single order
router.get(
    "/:orderId",
    isAuthenticated,
    getOrderById
);


// Cancel order
router.patch(
    "/:orderId/cancel",
    isAuthenticated,
    cancelOrder
);


export default router;