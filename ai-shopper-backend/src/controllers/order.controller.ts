import { Response } from "express";
import Cart from "../models/cart.model";
import Order from "../models/order.model";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /orders - Checkout
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );

    // Create order (snapshot items at time of purchase)
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        title: item.title || "",
        price: item.price || 0,
        quantity: item.quantity,
        thumbnail: item.thumbnail || "",
      })),
      totalAmount,
      status: "pending",
    });

    // Clear cart after checkout
    cart.items = [] as any;
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// GET /orders - List user's orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const orders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// GET /orders/:id - Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const order = await Order.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get order",
    });
  }
};