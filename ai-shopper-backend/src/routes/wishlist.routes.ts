import { Router } from "express";

import {
  getWishlistHandler,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
} from "../controllers/wishlist.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, getWishlistHandler);

router.post("/items", protect, addWishlistItem);

router.delete("/items/:productId", protect, removeWishlistItem);

router.delete("/", protect, clearWishlist);

export default router;
