import api from "@/lib/axios";

export const getProducts = async (limit?: number, skip?: number) => {
  const queryParts: string[] = [];
  if (limit && limit > 0) queryParts.push(`limit=${limit}`);
  if (skip && skip > 0) queryParts.push(`skip=${skip}`);
  const url = queryParts.length > 0 ? `/products?${queryParts.join("&")}` : "/products";
  const res = await api.get(url);
  return res.data;
};

export const getProductById = async (id: number) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/products/categories");
  return res.data;
};