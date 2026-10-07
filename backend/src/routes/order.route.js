import { Router } from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrdersForAdmin,
    getAdminOrderStats
} from "../controllers/order.controller.js";

import {
    authorizeRoles,
    isAuthenticated
} from "../middlewares/auth.middleware.js";

const router = Router();

// =====================================================
// ADMIN ORDER MANAGEMENT & ANALYTICS
// (Must be defined before /:orderId)
// =====================================================

router.get(
    "/admin/all",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    getAllOrdersForAdmin
);

router.get(
    "/admin/stats",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    getAdminOrderStats
);

// =====================================================
// CREATE ORDER
// =====================================================

router.post(
    "/",
    isAuthenticated,
    createOrder
);

// =====================================================
// GET MY ORDERS
// =====================================================

router.get(
    "/",
    isAuthenticated,
    getMyOrders
);

// =====================================================
// TRACK ORDER
// =====================================================

router.get(
    "/:orderId/track",
    isAuthenticated,
    trackOrder
);

// =====================================================
// GET SINGLE ORDER
// =====================================================

router.get(
    "/:orderId",
    isAuthenticated,
    getOrderById
);

// =====================================================
// CANCEL ORDER
// =====================================================

router.patch(
    "/:orderId/cancel",
    isAuthenticated,
    cancelOrder
);

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

router.patch(
    "/:orderId/status",
    isAuthenticated,
    authorizeRoles("admin", "shopkeeper"),
    updateOrderStatus
);

export default router;