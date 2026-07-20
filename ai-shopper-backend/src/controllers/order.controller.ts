import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
} from "../services/order.service";

// POST /orders - Checkout
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await createOrderFromCart(userId, req.body?.items, req.body?.totalAmount);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

// GET /orders - List user's orders with pagination
export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await getUserOrders(userId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /orders/:id - Get order by ID
export const getOrderByIdHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orderId = req.params.id as string;
    const order = await getOrderById(userId, orderId);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};