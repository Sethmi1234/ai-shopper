import api from "@/lib/axios";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  title?: string;
  thumbnail?: string;
  category?: string;
};

export type CartResponse = {
  items: CartItem[];
  total: number;
  count: number;
};

export const getCart = async (): Promise<CartResponse> => {
  const res = await api.get("/cart");
  return res.data;
};

export const addCartItem = async (item: CartItem): Promise<CartResponse> => {
  const res = await api.post("/cart/items", item);
  return res.data;
};

export const updateCartItem = async (
  id: string,
  data: { quantity: number }
): Promise<CartResponse> => {
  const res = await api.patch(`/cart/items/${id}`, data);
  return res.data;
};

export const removeCartItem = async (id: string): Promise<CartResponse> => {
  const res = await api.delete(`/cart/items/${id}`);
  return res.data;
};

export const clearCart = async (): Promise<CartResponse> => {
  const res = await api.delete("/cart");
  return res.data;
};
