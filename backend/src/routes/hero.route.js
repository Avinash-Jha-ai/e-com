import { Router } from "express";
import {
  getHeroSlides,
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleProductInHero,
} from "../controllers/hero.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

// Public: Get hero slides for customer storefront
router.get("/", getHeroSlides);

// Admin: Get all hero slides
router.get("/admin", isAuthenticated, authorizeRoles("admin", "shopkeeper"), getAdminHeroSlides);

// Admin: Create new hero slide
router.post("/", isAuthenticated, authorizeRoles("admin", "shopkeeper"), upload.single("heroImage"), createHeroSlide);

// Admin: Update hero slide
router.put("/:id", isAuthenticated, authorizeRoles("admin", "shopkeeper"), updateHeroSlide);

// Admin: Delete hero slide
router.delete("/:id", isAuthenticated, authorizeRoles("admin", "shopkeeper"), deleteHeroSlide);

// Admin: Quick 1-click toggle product in hero section
router.post("/toggle-product/:productId", isAuthenticated, authorizeRoles("admin", "shopkeeper"), toggleProductInHero);

export default router;
