import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlistByUser,
} from "../services/wishlist.service";
import { addWishlistSchema } from "../validators/wishlist.validator";

// GET /wishlist
export const getWishlistHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await getWishlist(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /wishlist/items
export const addWishlistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = addWishlistSchema.parse(req.body);
    const result = await addToWishlist(userId, data);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

// DELETE /wishlist/items/:productId
export const removeWishlistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId as string;
    const result = await removeFromWishlist(userId, productId);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

// DELETE /wishlist
export const clearWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await clearWishlistByUser(userId);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};