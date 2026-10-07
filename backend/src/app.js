import express from "express"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRouter from "./routes/auth.route.js";
import { apiLimiter } from "./middlewares/rate-limit.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import productRouter from "./routes/product.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import cartRouter from "./routes/cart.route.js";
const app =express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api",productRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/cart",cartRouter);

app.get("/", (req, res) => {
    res.json({ message: "Server is running..." });
});

app.use(errorHandler);

export default app;
