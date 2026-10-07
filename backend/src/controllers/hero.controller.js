import mongoose from "mongoose";
import heroModel from "../models/hero.model.js";
import productModel from "../models/product.model.js";
import { uploadImage } from "../services/cloudinary.service.js";

const canManageProduct = (req, product) =>
  req.userRole === "admin" || product.sellerID?.toString() === req.userId;

const canManageSlide = (req, slide) =>
  req.userRole === "admin" || slide.sellerID?.toString() === req.userId;

/**
 * Public: Get active hero slides for storefront hero section
 */
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await heroModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .populate("product", "title price discountPrice images shortDescription stock category");

    // Also fetch any products marked isHero: true
    const heroProducts = await productModel
      .find({ isHero: true })
      .select("title price discountPrice images shortDescription heroTagline heroSubtitle stock category");

    return res.status(200).json({
      success: true,
      message: "Hero slides fetched successfully",
      slides,
      heroProducts,
    });
  } catch (error) {
    console.error("Get Hero Slides Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hero slides",
    });
  }
};

/**
 * Admin: Get all hero slides (active & inactive)
 */
export const getAdminHeroSlides = async (req, res) => {
  try {
    const sellerFilter = req.userRole === "admin" ? {} : { sellerID: req.userId };
    const slides = await heroModel
      .find(sellerFilter)
      .sort({ order: 1, createdAt: -1 })
      .populate("product");

    const heroProducts = await productModel
      .find({
        isHero: true,
        ...(req.userRole === "admin" ? {} : { sellerID: req.userId }),
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      slides,
      heroProducts,
    });
  } catch (error) {
    console.error("Get Admin Hero Slides Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Create a new hero slide
 */
export const createHeroSlide = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      badge,
      image,
      productId,
      ctaText,
      ctaLink,
      order,
      isActive,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required for hero slide",
      });
    }

    let bannerImage = image;
    let linkedProduct = null;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      linkedProduct = await productModel.findById(productId);
      if (!linkedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      if (!canManageProduct(req, linkedProduct)) {
        return res.status(403).json({ success: false, message: "You do not have permission to use this product" });
      }
      if (linkedProduct) {
        linkedProduct.isHero = true;
        if (title) linkedProduct.heroTagline = title;
        if (subtitle) linkedProduct.heroSubtitle = subtitle;
        await linkedProduct.save();

        if (!bannerImage && linkedProduct.images?.length > 0) {
          const frontImg = linkedProduct.images.find((img) => img.isFront);
          bannerImage = frontImg ? frontImg.url : linkedProduct.images[0].url;
        }
      }
    }

    if (req.file) {
      bannerImage = await uploadImage(req.file, `ecommerce/${req.userId}/hero`);
    }

    if (!bannerImage) {
      return res.status(400).json({
        success: false,
        message: "Hero banner image URL is required",
      });
    }

    const newSlide = await heroModel.create({
      title,
      subtitle: subtitle || (linkedProduct ? linkedProduct.shortDescription : ""),
      badge: badge || "Featured Drape",
      image: bannerImage,
      product: linkedProduct ? linkedProduct._id : null,
      sellerID: req.userId,
      ctaText: ctaText || "Discover Drape",
      ctaLink: ctaLink || (linkedProduct ? `/product/${linkedProduct._id}` : "/shop"),
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const populatedSlide = await heroModel.findById(newSlide._id).populate("product");

    return res.status(201).json({
      success: true,
      message: "Hero slide created successfully",
      slide: populatedSlide,
    });
  } catch (error) {
    console.error("Create Hero Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Update hero slide
 */
export const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero slide ID",
      });
    }

    const {
      title,
      subtitle,
      badge,
      image,
      productId,
      ctaText,
      ctaLink,
      order,
      isActive,
    } = req.body;

    const slide = await heroModel.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Hero slide not found",
      });
    }

    if (!canManageSlide(req, slide)) {
      return res.status(403).json({ success: false, message: "You do not have permission to update this hero slide" });
    }

    if (title !== undefined) slide.title = title;
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (badge !== undefined) slide.badge = badge;
    if (image !== undefined) slide.image = image;
    if (ctaText !== undefined) slide.ctaText = ctaText;
    if (ctaLink !== undefined) slide.ctaLink = ctaLink;
    if (order !== undefined) slide.order = Number(order);
    if (isActive !== undefined) slide.isActive = Boolean(isActive);

    if (productId !== undefined) {
      if (productId && mongoose.Types.ObjectId.isValid(productId)) {
        const linkedProduct = await productModel.findById(productId);
        if (!linkedProduct) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (!canManageProduct(req, linkedProduct)) {
          return res.status(403).json({ success: false, message: "You do not have permission to use this product" });
        }
        slide.product = productId;
        await productModel.findByIdAndUpdate(productId, { isHero: true });
      } else {
        slide.product = null;
      }
    }

    await slide.save();
    const updatedSlide = await heroModel.findById(id).populate("product");

    return res.status(200).json({
      success: true,
      message: "Hero slide updated successfully",
      slide: updatedSlide,
    });
  } catch (error) {
    console.error("Update Hero Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Delete hero slide
 */
export const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero slide ID",
      });
    }

    const slide = await heroModel.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Hero slide not found",
      });
    }

    if (!canManageSlide(req, slide)) {
      return res.status(403).json({ success: false, message: "You do not have permission to delete this hero slide" });
    }

    await slide.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Hero slide deleted successfully",
    });
  } catch (error) {
    console.error("Delete Hero Slide Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Toggle product in Hero Section (1-click action)
 */
export const toggleProductInHero = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!canManageProduct(req, product)) {
      return res.status(403).json({ success: false, message: "You do not have permission to update this product" });
    }

    const newHeroStatus = !product.isHero;
    product.isHero = newHeroStatus;
    await product.save();

    if (newHeroStatus) {
      // Check if a slide already exists for this product
      const existingSlide = await heroModel.findOne({ product: productId });
      if (!existingSlide) {
        const frontImg = product.images?.find((img) => img.isFront) || product.images?.[0];
        await heroModel.create({
          title: product.heroTagline || product.title,
          subtitle: product.heroSubtitle || product.shortDescription,
          badge: "Editor's Drape Selection",
          image: frontImg?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90",
          product: product._id,
          sellerID: req.userId,
          ctaText: "Discover Drape",
          ctaLink: `/product/${product._id}`,
          order: 0,
          isActive: true,
        });
      } else {
        existingSlide.isActive = true;
        await existingSlide.save();
      }
    } else {
      // Deactivate associated slide
      await heroModel.updateMany({ product: productId }, { isActive: false });
    }

    return res.status(200).json({
      success: true,
      message: newHeroStatus
        ? "Product successfully added to Hero Section"
        : "Product removed from Hero Section",
      isHero: newHeroStatus,
      product,
    });
  } catch (error) {
    console.error("Toggle Product In Hero Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
