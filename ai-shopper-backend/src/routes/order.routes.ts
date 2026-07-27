import { Router } from "express";
import { orderController } from "../container";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// All order routes require authentication
router.use(protect);

// Checkout - convert cart to order
router.post("/", orderController.createOrder);

// Get all orders for current user
router.get("/", orderController.getOrders);

// Get single order by ID
router.get("/:id", orderController.getOrderByIdHandler);

export default router;