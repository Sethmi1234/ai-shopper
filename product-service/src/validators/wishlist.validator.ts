import { z } from "zod";

export const addWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be a positive number"),
  thumbnail: z.string().min(1, "Thumbnail URL is required"),
});