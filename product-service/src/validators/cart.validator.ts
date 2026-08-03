import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  thumbnail: z.string().min(1, "Thumbnail URL is required"),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});