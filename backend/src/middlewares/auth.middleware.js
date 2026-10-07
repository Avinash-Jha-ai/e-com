import jwt from "jsonwebtoken";
import { configs } from "../configs/config.js";

export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      configs.JWT_SECRET
    );

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = {
      _id: decoded.userId,
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource",
    });
  }

  next();
};
