import Razorpay from "razorpay";
import { configs } from "./config.js";

const razorpay = new Razorpay({
    key_id: configs.RAZORPAY_KEY_ID,
    key_secret: configs.RAZORPAY_KEY_SECRET
});

export default razorpay;