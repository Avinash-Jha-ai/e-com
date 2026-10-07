import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { uploadImage } from "../services/cloudinary.service.js";
import { configs } from "../configs/config.js";
import { generateOTP } from "../utils/otp.js";
import redis from "../configs/redis.js";
import { sendOTP } from "../services/email.service.js";
import jwt from "jsonwebtoken";

const ROLES = Object.freeze({
  USER: "user",
  SHOPKEEPER: "shopkeeper",
  ADMIN: "admin",
});

const getRequiredRole = (req) => req.authRole || ROLES.USER;

const registrationKey = (role, email) => `register:${role}:${email}`;

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
});

const createToken = (user) => jwt.sign(
  { userId: user._id, role: user.role },
  configs.JWT_SECRET,
  { expiresIn: "7d" }
);

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    const role = getRequiredRole(req);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name email and password is missing in register",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const isExist = await userModel.findOne({ email: normalizedEmail });

    if (isExist) {
      return res.status(400).json({
        success: false,
        message: "user already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let avatar;

    if (req.file) {
      avatar = await uploadImage(
        req.file,
        "ecommerce/users"
      );
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    await redis.set(
      registrationKey(role, normalizedEmail),
      JSON.stringify({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatar,
        role,
        otp: otpHash,
      }),
      "EX",
      300
    );

    try {
      await sendOTP(normalizedEmail, otp);
    } catch (emailError) {
      await redis.del(registrationKey(role, normalizedEmail));
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const role = getRequiredRole(req);

    const data = await redis.get(
      registrationKey(role, normalizedEmail)
    );

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const registrationData = JSON.parse(data);

    const isOTPValid = await bcrypt.compare(otp, registrationData.otp);

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if user was registered in the meantime
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      await redis.del(registrationKey(role, normalizedEmail));
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user after OTP verification
    const user = await userModel.create({
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      avatar: registrationData.avatar,
      isVerify: true,
      role: registrationData.role,
    });

    // Delete OTP
    await redis.del(
      registrationKey(role, normalizedEmail)
    );

    // Generate JWT
    const token = createToken(user);

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Verify Register OTP Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const role = getRequiredRole(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await userModel
      .findOne({
        email: normalizedEmail,
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerify) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (role === "admin" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Account does not have administrator privileges",
      });
    }

    // Generate JWT
    const token = createToken(user);

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await userModel
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendChangePasswordOTP = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    const otpHash = await bcrypt.hash(otp, 10);

    await redis.set(
      `change-password:${user.email}`,
      otpHash,
      "EX",
      300
    );

    try {
      await sendOTP(user.email, otp);
    } catch (emailError) {
      await redis.del(`change-password:${user.email}`);
      console.error("Failed to send change password email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password change OTP sent to your email",
    });
  } catch (error) {
    console.error(
      "Send Change Password OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body ?? {};

    if (!otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "OTP and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const userId = req.userId || req.user?._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedOTP = await redis.get(
      `change-password:${user.email}`
    );

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const isOTPValid = await bcrypt.compare(otp, storedOTP);

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    user.password = hashedPassword;

    await user.save();

    // OTP can only be used once
    await redis.del(
      `change-password:${user.email}`
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const userId = req.userId || req.user?._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const makeDefault = isDefault || user.addresses.length === 0;
    if (makeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: makeDefault,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
