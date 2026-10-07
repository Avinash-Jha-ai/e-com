import mongoose from "mongoose";
import productModel from "../models/product.model.js";
import heroModel from "../models/hero.model.js";
import { generateProductDetails } from "../services/gemini.service.js";
import { uploadImage } from "../services/cloudinary.service.js";

const OCCASIONS = new Set(["festive", "wedding", "everyday", "statement"]);
const FABRICS = new Set(["silk", "organza", "chiffon", "georgette", "linen"]);

const normaliseCatalogValue = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

export const uploadProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            price,
            discountPrice,
            stock,
            category,
            occasion,
            fabric,
            isHero,
            heroTagline,
            heroSubtitle,
            isFeatured,
            tags,
            frontImageIndex
        } = req.body;

        // Logged-in seller ID comes from auth middleware
        const sellerId = req.userId || req.user?._id;

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
            price === undefined ||
            price === null ||
            price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter proper detail in upload product"
            });
        }

        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number"
            });
        }

        const numericDiscountPrice = discountPrice !== undefined && discountPrice !== "" ? Number(discountPrice) : 0;
        if (Number.isNaN(numericDiscountPrice) || numericDiscountPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Discount price must be a valid non-negative number"
            });
        }

        const numericStock = stock !== undefined ? Number(stock) : 10;
        if (Number.isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid non-negative number"
            });
        }

        const productOccasion = normaliseCatalogValue(occasion || category || "everyday");
        const productFabric = normaliseCatalogValue(fabric);

        if (!OCCASIONS.has(productOccasion)) {
            return res.status(400).json({
                success: false,
                message: "Occasion must be festive, wedding, everyday, or statement"
            });
        }

        if (productFabric && !FABRICS.has(productFabric)) {
            return res.status(400).json({
                success: false,
                message: "Fabric must be silk, organza, chiffon, georgette, or linen"
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
        const selectedFrontIndex = Number(frontImageIndex || 0);

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

        const parsedIsHero = String(isHero) === "true";
        const parsedIsFeatured = String(isFeatured) === "true";
        let parsedTags = [];
        if (Array.isArray(tags)) {
            parsedTags = tags;
        } else if (typeof tags === "string" && tags.trim()) {
            parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
        }

        // Create product
        const product = await productModel.create({
            title,
            description,
            shortDescription,
            price: numericPrice,
            discountPrice: numericDiscountPrice,
            stock: numericStock,
            category: category || productOccasion,
            occasion: productOccasion,
            fabric: productFabric || undefined,
            isHero: parsedIsHero,
            heroTagline: heroTagline || "",
            heroSubtitle: heroSubtitle || "",
            isFeatured: parsedIsFeatured,
            tags: parsedTags,
            sellerID: sellerId,
            images
        });

        // If marked as Hero, create or update a HeroSlide
        if (parsedIsHero) {
            const frontImg = images.find((i) => i.isFront) || images[0];
            await heroModel.create({
                title: heroTagline || title,
                subtitle: heroSubtitle || shortDescription,
                badge: "Curator's Drape Edit",
                image: frontImg?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90",
                product: product._id,
                ctaText: "Discover Drape",
                ctaLink: `/product/${product._id}`,
                order: 0,
                isActive: true,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Product has been created",
            product
        });

    } catch (error) {
        console.error("Upload Product Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (
            req.userRole !== "admin" &&
            product.sellerID.toString() !== (req.userId || req.user?._id?.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this product",
            });
        }

        const {
            title,
            description,
            shortDescription,
            price,
            discountPrice,
            stock,
            category,
            occasion,
            fabric,
            isHero,
            heroTagline,
            heroSubtitle,
            isFeatured,
            tags,
        } = req.body;

        if (title !== undefined) product.title = title;
        if (description !== undefined) product.description = description;
        if (shortDescription !== undefined) product.shortDescription = shortDescription;
        if (price !== undefined) {
            const numericPrice = toOptionalNumber(price);
            if (numericPrice === null || numericPrice === undefined || numericPrice < 0) {
                return res.status(400).json({ success: false, message: "Price must be a valid non-negative number" });
            }
            product.price = numericPrice;
        }
        if (discountPrice !== undefined) {
            const numericDiscountPrice = toOptionalNumber(discountPrice);
            if (numericDiscountPrice === null || numericDiscountPrice < 0) {
                return res.status(400).json({ success: false, message: "Discount price must be a valid non-negative number" });
            }
            product.discountPrice = numericDiscountPrice ?? 0;
        }
        if (stock !== undefined) {
            const numericStock = toOptionalNumber(stock);
            if (numericStock === null || numericStock === undefined || numericStock < 0) {
                return res.status(400).json({ success: false, message: "Stock must be a valid non-negative number" });
            }
            product.stock = numericStock;
        }
        if (category !== undefined) product.category = category;
        if (occasion !== undefined) {
            const productOccasion = normaliseCatalogValue(occasion);
            if (!OCCASIONS.has(productOccasion)) {
                return res.status(400).json({ success: false, message: "Invalid occasion" });
            }
            product.occasion = productOccasion;
        }
        if (fabric !== undefined) {
            const productFabric = normaliseCatalogValue(fabric);
            if (productFabric && !FABRICS.has(productFabric)) {
                return res.status(400).json({ success: false, message: "Invalid fabric" });
            }
            product.fabric = productFabric || undefined;
        }
        if (heroTagline !== undefined) product.heroTagline = heroTagline;
        if (heroSubtitle !== undefined) product.heroSubtitle = heroSubtitle;
        if (isFeatured !== undefined) product.isFeatured = String(isFeatured) === "true";

        if (tags !== undefined) {
            if (Array.isArray(tags)) product.tags = tags;
            else if (typeof tags === "string") {
                product.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
            }
        }

        if (isHero !== undefined) {
            const parsedHero = String(isHero) === "true";
            product.isHero = parsedHero;

            if (parsedHero) {
                const existingSlide = await heroModel.findOne({ product: id });
                if (!existingSlide) {
                    const frontImg = product.images.find((i) => i.isFront) || product.images[0];
                    await heroModel.create({
                        title: heroTagline || product.title,
                        subtitle: heroSubtitle || product.shortDescription,
                        badge: "Handloom Edit 2026",
                        image: frontImg?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90",
                        product: product._id,
                        ctaText: "Discover Drape",
                        ctaLink: `/product/${product._id}`,
                        order: 0,
                        isActive: true,
                    });
                } else {
                    existingSlide.isActive = true;
                    if (heroTagline) existingSlide.title = heroTagline;
                    if (heroSubtitle) existingSlide.subtitle = heroSubtitle;
                    await existingSlide.save();
                }
            } else {
                await heroModel.updateMany({ product: id }, { isActive: false });
            }
        }

        // If new images were uploaded
        if (req.files && req.files.length > 0) {
            const sellerId = req.userId || req.user?._id;
            const newImages = await Promise.all(
                req.files.map(async (file, index) => {
                    const imageUrl = await uploadImage(
                        file,
                        `ecommerce/${sellerId}/products`
                    );
                    return {
                        url: imageUrl,
                        isFront: index === 0 && product.images.length === 0,
                    };
                })
            );
            product.images.push(...newImages);
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("Update Product Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllProduct = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;

        const {
            category,
            collection,
            occasion,
            fabric,
            minPrice,
            maxPrice,
            inStock,
            isHero,
            isFeatured,
            sort,
            search,
        } = req.query;

        const filters = [];
        const requestedOccasion = normaliseCatalogValue(occasion || category || collection);
        const requestedFabric = normaliseCatalogValue(fabric);
        const minimumPrice = toOptionalNumber(minPrice);
        const maximumPrice = toOptionalNumber(maxPrice);

        if (minimumPrice === null || maximumPrice === null ||
            (minimumPrice !== undefined && minimumPrice < 0) ||
            (maximumPrice !== undefined && maximumPrice < 0) ||
            (minimumPrice !== undefined && maximumPrice !== undefined && minimumPrice > maximumPrice)) {
            return res.status(400).json({ success: false, message: "Enter a valid price range" });
        }

        // "new" is a collection shortcut for the newest products, not an occasion.
        if (requestedOccasion && requestedOccasion !== "all" && requestedOccasion !== "new") {
            if (!OCCASIONS.has(requestedOccasion)) {
                return res.status(400).json({ success: false, message: "Invalid occasion filter" });
            }

            const legacyOccasion = new RegExp(`^${escapeRegExp(requestedOccasion)}$`, "i");
            filters.push({
                $or: [
                    { occasion: requestedOccasion },
                    { category: legacyOccasion },
                    { tags: legacyOccasion },
                ]
            });
        }

        if (requestedFabric && requestedFabric !== "all") {
            if (!FABRICS.has(requestedFabric)) {
                return res.status(400).json({ success: false, message: "Invalid fabric filter" });
            }

            const legacyFabric = new RegExp(escapeRegExp(requestedFabric), "i");
            filters.push({
                $or: [
                    { fabric: requestedFabric },
                    { category: legacyFabric },
                    { tags: legacyFabric },
                    { title: legacyFabric },
                    { description: legacyFabric },
                    { shortDescription: legacyFabric },
                ]
            });
        }

        if (minimumPrice !== undefined || maximumPrice !== undefined) {
            const priceFilter = {};
            if (minimumPrice !== undefined) priceFilter.$gte = minimumPrice;
            if (maximumPrice !== undefined) priceFilter.$lte = maximumPrice;
            filters.push({ price: priceFilter });
        }

        if (String(inStock) === "true") {
            filters.push({ stock: { $gt: 0 } });
        }

        if (isHero !== undefined) {
            filters.push({ isHero: String(isHero) === "true" });
        }

        if (isFeatured !== undefined) {
            filters.push({ isFeatured: String(isFeatured) === "true" });
        }

        if (search && search.trim()) {
            const escapedSearch = escapeRegExp(search.trim());
            filters.push({
                $or: [
                    { title: { $regex: escapedSearch, $options: "i" } },
                    { description: { $regex: escapedSearch, $options: "i" } },
                    { shortDescription: { $regex: escapedSearch, $options: "i" } },
                    { category: { $regex: escapedSearch, $options: "i" } },
                    { occasion: { $regex: escapedSearch, $options: "i" } },
                    { fabric: { $regex: escapedSearch, $options: "i" } },
                    { tags: { $regex: escapedSearch, $options: "i" } },
                ]
            });
        }

        const filter = filters.length ? { $and: filters } : {};

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === "price-asc" || sort === "price-low") sortOption = { price: 1, _id: 1 };
        else if (sort === "price-desc" || sort === "price-high") sortOption = { price: -1, _id: -1 };
        else if (sort === "oldest") sortOption = { createdAt: 1 };
        else if (sort === "title") sortOption = { title: 1 };

        const [products, totalProducts] = await Promise.all([
            productModel
                .find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit),

            productModel.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            pagination: {
                page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            appliedFilters: {
                occasion: requestedOccasion || null,
                fabric: requestedFabric || null,
                minPrice: minimumPrice ?? null,
                maxPrice: maximumPrice ?? null,
                inStock: String(inStock) === "true"
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
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const sellerFilter = req.userRole === "admin" ? {} : { sellerID: req.userId };

        const [products, totalProducts] = await Promise.all([
            productModel
                .find(sellerFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            productModel.countDocuments(sellerFilter)
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            message: "Store products fetched successfully",
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

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (
            req.userRole !== "admin" &&
            product.sellerID.toString() !== (req.userId || req.user?._id?.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this product",
            });
        }

        await product.deleteOne();

        // Also clean up any hero slides linked to this product
        await heroModel.deleteMany({ product: productId });

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
        const query = typeof req.query.search === "string" ? req.query.search.trim() : "";

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const escapedSearch = escapeRegExp(query);

        const products = await productModel
            .find({
                $or: [
                    { title: { $regex: escapedSearch, $options: "i" } },
                    { shortDescription: { $regex: escapedSearch, $options: "i" } },
                    { description: { $regex: escapedSearch, $options: "i" } },
                    { category: { $regex: escapedSearch, $options: "i" } },
                    { occasion: { $regex: escapedSearch, $options: "i" } },
                    { fabric: { $regex: escapedSearch, $options: "i" } },
                    { tags: { $regex: escapedSearch, $options: "i" } },
                ]
            })
            .select("title images price discountPrice stock shortDescription category occasion fabric isHero")
            .sort({ title: 1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            search: query,
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
