import api from "@/lib/axios";

export const getProductsByCategory = async (slug: string) => {
  const res = await api.get(`/products/category/${slug}`);
  return res.data;
};
