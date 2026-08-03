import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { CartService } from "../services/cart.service";
import { addItemSchema, updateItemSchema } from "../validators/cart.validator";

export class CartController {
  constructor(private cartService: CartService) {}

  // GET /cart - Get current user's cart
  getCartHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.cartService.getCart(req.user!.id);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // POST /cart/items - Add item to cart
  addItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = addItemSchema.parse(req.body);
      const result = await this.cartService.addItemToCart(req.user!.id, data);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // PATCH /cart/items/:id - Update item quantity
  updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateItemSchema.parse(req.body);
      const id = req.params.id as string;
      const result = await this.cartService.updateCartItem(req.user!.id, id, data);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // DELETE /cart/items/:id - Remove item from cart
  removeItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await this.cartService.removeCartItem(req.user!.id, id);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  };

  // DELETE /cart - Clear cart
  clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.cartService.clearCartByUser(req.user!.id);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  };
}