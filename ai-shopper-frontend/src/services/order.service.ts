import api from "../lib/axios";

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  title?: string;
  thumbnail?: string;
  category?: string;
};

export type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
};

export const createOrder = async (data: CreateOrderInput): Promise<Order> => {
  const res = await api.post("/orders", data);
  return res.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders");
  return res.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const res = await api.patch(`/orders/${id}/cancel`);
  return res.data;
};
