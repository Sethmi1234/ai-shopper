import Cart from "../models/cart.model";
import Order from "../models/order.model";

export interface OrderResult {
  message: string;
  order: any;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

export interface OrdersListResult {
  orders: any[];
  pagination: PaginationInfo;
}

export const createOrderFromCart = async (
  userId: string,
  bodyItems?: any[],
  bodyTotalAmount?: number
): Promise<OrderResult> => {
  let items = bodyItems;
  let totalAmount = bodyTotalAmount;

  if (!items || !Array.isArray(items) || items.length === 0) {
    // Fallback: Find user's cart in MongoDB
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      throw Object.assign(
        new Error(
          "Cart is empty. Please add items to your cart before checkout."
        ),
        { statusCode: 400 }
      );
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

    return {
      message: "Order created successfully",
      order,
    };
  }

  // Items provided in request body - use those directly
  if (!totalAmount) {
    totalAmount = items.reduce(
      (total: number, item: any) =>
        total +
        (Number(item.price) || 0) * (Number(item.quantity) || 1),
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

  return {
    message: "Order created successfully",
    order,
  };
};

export const getUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<OrdersListResult> => {
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

  return {
    orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      limit,
    },
  };
};

export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<any> => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  }

  return order;
};