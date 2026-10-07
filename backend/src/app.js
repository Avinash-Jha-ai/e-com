import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.route.js";
import { apiLimiter } from "./middlewares/rate-limit.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import productRouter from "./routes/product.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js";
import heroRouter from "./routes/hero.route.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-admin-registration-secret",
    ],
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api", productRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRoute);
app.use("/api/hero", heroRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server is running..." });
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
