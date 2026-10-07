import { Router } from "express";

import {
    createPaymentOrder,
    verifyPayment
} from "../controllers/payment.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";


const router = Router();


// Create Razorpay order
router.post(
    "/create",
    isAuthenticated,
    createPaymentOrder
);


// Verify payment
router.post(
    "/verify",
    isAuthenticated,
    verifyPayment
);


export default router;