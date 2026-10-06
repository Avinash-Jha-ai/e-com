import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default:
        "https://media.istockphoto.com/id/2168774111/vector/avatar-or-person-sign-profile-picture-portrait-icon-user-profile-symbol.jpg?s=612x612&w=0&k=20&c=6qw1LRG53z00RXJnVKQC58W7XnW2gdQfGBIR43E97Oc=",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // Email verified or not
    isVerify: {
      type: Boolean,
      default: false,
    },

    addresses: [
      {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, default: "India", trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],

  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
