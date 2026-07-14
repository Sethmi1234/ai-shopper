import api from "../lib/axios";

export type OrderItem = {
  productId: string;
  id?: number;
  quantity: number;
  price: number;
  title?: string;
  thumbnail?: string;
};

export type Order = {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt?: string;
};

export type CreateOrderResponse = {
  message: string;
  order: Order;
};

export type OrdersResponse = {
  orders: Order[];
};

export const createOrder = async (items: OrderItem[], totalAmount: number): Promise<CreateOrderResponse> => {
  const res = await api.post("/orders", {
    items,
    totalAmount,
  });
  return res.data;
};

export const getOrders = async (): Promise<OrdersResponse> => {
  const res = await api.get("/orders");
  return res.data;
};

export const getOrderById = async (id: string): Promise<{ order: Order }> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const res = await api.patch(`/orders/${id}/cancel`);
  return res.data;
};