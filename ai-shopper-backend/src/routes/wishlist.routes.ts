import { Router } from "express";

import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "../controllers/wishlist.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, getWishlist);

router.post("/items", protect, addWishlistItem);

router.delete("/items/:productId", protect, removeWishlistItem);

export default router;