import dummyApi from "../lib/dummyApi";

export const getProductsByCategory = async (slug: string) => {
  const res = await dummyApi.get(`/products/category/${slug}`);
  return res.data;
};
