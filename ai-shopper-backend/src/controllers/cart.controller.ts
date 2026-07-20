import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCartByUser,
} from "../services/cart.service";
import { addItemSchema, updateItemSchema } from "../validators/cart.validator";

// GET /cart - Get current user's cart
export const getCartHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getCart(req.user!.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
};

// POST /cart/items - Add item to cart
export const addItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = addItemSchema.parse(req.body);
    const result = await addItemToCart(req.user!.id, data);
    res.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

// PATCH /cart/items/:id - Update item quantity
export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateItemSchema.parse(req.body);
    const id = req.params.id as string;
    const result = await updateCartItem(req.user!.id, id, data);
    res.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

// DELETE /cart/items/:id - Remove item from cart
export const removeItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await removeCartItem(req.user!.id, id);
    res.json(result);
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

// DELETE /cart - Clear cart
export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await clearCartByUser(req.user!.id);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
};