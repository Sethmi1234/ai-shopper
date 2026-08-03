import { Router } from "express";

import { cartController } from "../container";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get("/", cartController.getCartHandler);

router.post("/items", cartController.addItem);

router.patch("/items/:id", cartController.updateItem);

router.delete("/items/:id", cartController.removeItem);

router.delete("/", cartController.clearCart);

export default router;