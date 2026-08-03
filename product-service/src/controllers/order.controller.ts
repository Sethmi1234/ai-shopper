import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { OrderService } from "../services/order.service";

export class OrderController {
  constructor(private orderService: OrderService) {}

  // POST /orders - Checkout
  createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.orderService.createOrderFromCart(userId, req.body?.items, req.body?.totalAmount);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // GET /orders - List user's orders with pagination
  getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await this.orderService.getUserOrders(userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // GET /orders/:id - Get order by ID
  getOrderByIdHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const orderId = req.params.id as string;
      const order = await this.orderService.getOrderById(userId, orderId);
      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  };
}