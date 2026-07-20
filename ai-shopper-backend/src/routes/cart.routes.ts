import { Router } from "express";

import {
  getCartHandler,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from "../controllers/cart.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCartHandler);

router.post("/items", addItem);

router.patch("/items/:id", updateItem);

router.delete("/items/:id", removeItem);

router.delete("/", clearCart);

export default router;