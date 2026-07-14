import { Response } from "express";
import Cart from "../models/cart.model";
import Order from "../models/order.model";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /orders - Checkout
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Get items from request body (frontend sends items directly)
    // Fallback to MongoDB cart if no items in body
    let items = req.body?.items;
    let totalAmount = req.body?.totalAmount;

    if (!items || !Array.isArray(items) || items.length === 0) {
      // Fallback: Find user's cart in MongoDB
      const cart = await Cart.findOne({ user: userId });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          message: "Cart is empty. Please add items to your cart before checkout.",
        });
      }

      // Calculate total from cart
      totalAmount = cart.items.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );

      // Create order from cart items
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

      return res.status(201).json({
        message: "Order created successfully",
        order,
      });
    }

    // Items provided in request body - use those directly
    // Calculate total if not provided
    if (!totalAmount) {
      totalAmount = items.reduce(
        (total: number, item: any) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
    }

    // Create order with items from body
    const order = await Order.create({
      user: userId,
      items: items.map((item: any) => ({
        productId: String(item.productId || item.id || ""),
        title: item.title || "",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        thumbnail: item.thumbnail || "",
      })),
      totalAmount: Number(totalAmount),
      status: "pending",
    });

    // Also clear the MongoDB cart if it exists
    try {
      const cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.items = [] as any;
        await cart.save();
      }
    } catch (err) {
      // Non-critical - order was already created
      console.warn("Failed to clear cart after order", err);
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: error.message || "Failed to create order",
    });
  }
};

// GET /orders - List user's orders with pagination
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({
        createdAt: -1,
      });

    const totalOrders = await Order.countDocuments({
      user: userId,
    });

    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit,
      },
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