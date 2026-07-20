import { Router } from "express";

import {
  createOrder,
  getOrders,
  getOrderByIdHandler,
} from "../controllers/order.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// All order routes require authentication
router.use(protect);

// Checkout - convert cart to order
router.post("/", createOrder);

// Get all orders for current user
router.get("/", getOrders);

// Get single order by ID
router.get("/:id", getOrderByIdHandler);

export default router;