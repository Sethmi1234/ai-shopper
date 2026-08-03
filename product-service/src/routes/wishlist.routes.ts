import { Router } from "express";
import { wishlistController } from "../container";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, wishlistController.getWishlistHandler);

router.post("/items", protect, wishlistController.addWishlistItem);

router.delete("/items/:productId", protect, wishlistController.removeWishlistItem);

router.delete("/", protect, wishlistController.clearWishlist);

export default router;
