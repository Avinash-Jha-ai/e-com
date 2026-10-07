import mongoose from "mongoose";
import productModel from "../models/product.model.js";
import { generateProductDetails } from "../services/gemini.service.js";
import { uploadImage } from "../services/cloudinary.service.js";

export const uploadProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            price,
            stock,
            frontImageIndex
        } = req.body;

        // Logged-in seller ID comes from auth middleware
        const sellerId = req.userId;

        // Check authentication
        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: "Seller authentication required"
            });
        }

        // Validate product details
        if (
            !title ||
            !description ||
            !shortDescription ||
            !price
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter proper detail in upload product"
            });
        }

        // Check images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image"
            });
        }

        // Front image index
        const selectedFrontIndex = Number(frontImageIndex);

        if (
            Number.isNaN(selectedFrontIndex) ||
            selectedFrontIndex < 0 ||
            selectedFrontIndex >= req.files.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid front image index"
            });
        }

        // Upload all images
        const images = await Promise.all(
            req.files.map(async (file, index) => {

                const imageUrl = await uploadImage(
                    file,
                    `ecommerce/${sellerId}/products`
                );

                return {
                    url: imageUrl,

                    // Selected image becomes front image
                    isFront: index === selectedFrontIndex
                };
            })
        );

        // Create product
        const product = await productModel.create({
            title,
            description,
            shortDescription,
            price,
            stock,
            sellerID: sellerId,
            images
        });

        return res.status(201).json({
            success: true,
            message: "Product has been created",
            product
        });

    } catch (error) {

        console.error(
            "Upload Product Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllProduct = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            productModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            productModel.countDocuments()
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            message: "All products fetched",
            success: true,
            pagination: {
                page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            products
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

export const getSellerProduct = async (req, res) => {
    try {

        const sellerId = req.userId;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            productModel
                .find({
                    sellerID: sellerId
                })
                .skip(skip)
                .limit(limit),

            productModel.countDocuments({
                sellerID: sellerId
            })
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            message: "Seller products fetched successfully",
            success: true,
            pagination: {
                currentPage: page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            products
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

export const getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product details fetched successfully",
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await productModel.findOne({
            _id: productId,
            sellerID: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await productModel.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product has been deleted"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const searchProduct = async (req, res) => {
    try {
        const search = req.query.search?.trim();

        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const products = await productModel
            .find({
                title: {
                    $regex: `^${search}`,
                    $options: "i"
                }
            })
            .select("title images price")
            .sort({ title: 1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            search,
            count: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const generateProductAI = async (req, res) => {
    try {
        if (!req.files?.length) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one product image"
            });
        }

        const aiData = await generateProductDetails(req.files);

        if (
            !Number.isInteger(aiData.frontImageIndex) ||
            aiData.frontImageIndex < 0 ||
            aiData.frontImageIndex >= req.files.length
        ) {
            throw new Error("AI returned an invalid front image index");
        }

        return res.status(200).json({
            success: true,
            message: "Product details generated successfully",
            data: aiData
        });

    } catch (error) {
        console.error("Product AI Error:", error);

        const upstreamStatus = Number(error?.status ?? error?.code);
        const isTemporarilyUnavailable =
            upstreamStatus === 429 || upstreamStatus >= 500;

        return res.status(isTemporarilyUnavailable ? 503 : 500).json({
            success: false,
            message: isTemporarilyUnavailable
                ? "AI service is temporarily unavailable. Please try again shortly."
                : "Failed to generate product details"
        });
    }
};