import Order from "../models/order.model";

export class OrderRepository {
  async create(orderData: any) {
    return Order.create(orderData);
  }

  async findByUserIdPaginated(userId: string, skip: number, limit: number) {
    return Order.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async countDocumentsByUserId(userId: string) {
    return Order.countDocuments({ user: userId });
  }

  async findByIdAndUserId(orderId: string, userId: string) {
    return Order.findOne({
      _id: orderId,
      user: userId,
    });
  }
}
