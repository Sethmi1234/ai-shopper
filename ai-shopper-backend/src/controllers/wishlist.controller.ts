import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { WishlistService } from "../services/wishlist.service";
import { addWishlistSchema } from "../validators/wishlist.validator";

export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  // GET /wishlist
  getWishlistHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.wishlistService.getWishlist(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // POST /wishlist/items
  addWishlistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = addWishlistSchema.parse(req.body);
      const result = await this.wishlistService.addToWishlist(userId, data);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // DELETE /wishlist/items/:productId
  removeWishlistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const productId = req.params.productId as string;
      const result = await this.wishlistService.removeFromWishlist(userId, productId);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // DELETE /wishlist
  clearWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.wishlistService.clearWishlistByUser(userId);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  };
}