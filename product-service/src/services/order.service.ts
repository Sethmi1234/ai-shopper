import { OrderRepository } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository";
import { AppError } from "../utils/AppError";
import { OrderResultDto, OrdersListResultDto } from "../dto/order.dto";

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository
  ) {}

  async createOrderFromCart(
    userId: string,
    bodyItems?: any[],
    bodyTotalAmount?: number
  ): Promise<OrderResultDto> {
    let items = bodyItems;
    let totalAmount = bodyTotalAmount;

    if (!items || !Array.isArray(items) || items.length === 0) {
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart || cart.items.length === 0) {
        throw new AppError(
          400,
          "Cart is empty. Please add items to your cart before checkout."
        );
      }

      totalAmount = cart.items.reduce(
        (total: number, item: any) => total + (item.price || 0) * item.quantity,
        0
      );

      const order = await this.orderRepository.create({
        user: userId,
        items: cart.items.map((item: any) => ({
          productId: item.productId,
          title: item.title || "",
          price: item.price || 0,
          quantity: item.quantity,
          thumbnail: item.thumbnail || "",
        })),
        totalAmount,
        status: "pending",
      });

      cart.items = [] as any;
      await this.cartRepository.save(cart);

      return {
        message: "Order created successfully",
        order,
      };
    }

    if (!totalAmount) {
      totalAmount = items.reduce(
        (total: number, item: any) =>
          total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
    }

    const order = await this.orderRepository.create({
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

    try {
      const cart = await this.cartRepository.findByUserId(userId);
      if (cart) {
        cart.items = [] as any;
        await this.cartRepository.save(cart);
      }
    } catch (err) {
      console.warn("Failed to clear cart after order", err);
    }

    return {
      message: "Order created successfully",
      order,
    };
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<OrdersListResultDto> {
    const skip = (page - 1) * limit;

    const orders = await this.orderRepository.findByUserIdPaginated(
      userId,
      skip,
      limit
    );

    const totalOrders = await this.orderRepository.countDocumentsByUserId(
      userId
    );

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit,
      },
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<any> {
    const order = await this.orderRepository.findByIdAndUserId(orderId, userId);

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    return order;
  }
}