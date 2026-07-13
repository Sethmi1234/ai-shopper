import api from "../lib/axios";

export type WishlistItem = {
  id: string;
  productId: string;
  title?: string;
  price: number;
  thumbnail?: string;
  category?: string;
  rating?: number;
};

export type WishlistResponse = {
  items: WishlistItem[];
  count: number;
};

export const getWishlist = async (): Promise<WishlistResponse> => {
  const res = await api.get("/wishlist");
  return res.data;
};

export const addWishlistItem = async (item: Omit<WishlistItem, "id">): Promise<WishlistResponse> => {
  const res = await api.post("/wishlist/items", item);
  return res.data;
};

export const removeWishlistItem = async (id: string): Promise<WishlistResponse> => {
  const res = await api.delete(`/wishlist/items/${id}`);
  return res.data;
};

export const clearWishlist = async (): Promise<WishlistResponse> => {
  const res = await api.delete("/wishlist");
  return res.data;
};
