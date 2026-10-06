import streamifier from "streamifier";
import cloudinary from "../configs/cloudinary.js";

export const uploadImage = async (file, folder = "ecommerce") => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: "image",
      }, (error, uploadResult) => {
        if (error) return reject(error);
        resolve(uploadResult);
      });

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Image deletion failed");
  }
};
