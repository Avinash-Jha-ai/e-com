import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { uploadImage } from "../services/cloudinary.service.js";
import { configs } from "../configs/config.js";
import { generateOTP } from "../utils/otp.js";
import redis from "../configs/redis.js";
import { sendOTP } from "../services/email.service.js";
import jwt from "jsonwebtoken";


export const register=async (req,res)=>{
    const {name ,email,password} = req.body ?? {};

    if(!name || !email || !password){

        return res.status(400).json({
           success:false,
           message:"name email and password is missing in register",
        })
    }

    const normalizedEmail = email.toLowerCase().trim();

    const isExist =await userModel.findOne({email :normalizedEmail});

    

    if(isExist){
        return res.status(400).json({
            success:false,
            message:"user already exist",
        })
    }

    const hashedPassword =await bcrypt.hash(password,12);

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
      `register:${normalizedEmail}`,
      JSON.stringify({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatar,
        otp: otpHash,
      }),
      "EX",
      300
    );

    await sendOTP(normalizedEmail, otp);

    

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });


}   

export const verifyRegisterOTP =async (req,res)=>{

    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const data = await redis.get(
      `register:${normalizedEmail}`
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

    // Create user after OTP verification
    const user = await userModel.create({
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      avatar: registrationData.avatar,
      isVerify: true,
    });

    // Delete OTP
    await redis.del(
      `register:${normalizedEmail}`
    );

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

}

export const login =async (req,res)=>{
    const { email, password } = req.body ?? {};

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

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      configs.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

}

export const getMe = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
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
    const user = await userModel.findById(req.userId);

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

    await sendOTP(user.email, otp);

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

    const user = await userModel.findById(req.userId);

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

    const user = await userModel.findById(req.userId);

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
