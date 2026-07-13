import { Response } from "express";
import Wishlist from "../models/wishlist.model";
import { AuthRequest } from "../middleware/auth.middleware";

// GET /wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [],
      });
    }

    res.status(200).json({
      products: wishlist.products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get wishlist",
    });
  }
};

// POST /wishlist/items
export const addWishlistItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId, title, price, thumbnail } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [],
      });
    }

    const exists = wishlist.products.some(
      (item) => item.productId === productId
    );

    if (exists) {
      return res.status(400).json({
        message: "Product already in wishlist",
      });
    }

    wishlist.products.push({
      productId,
      title,
      price,
      thumbnail,
    } as any);

    await wishlist.save();

    res.status(200).json({
      products: wishlist.products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add wishlist item",
    });
  }
};

// DELETE /wishlist/items/:productId
export const removeWishlistItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.productId !== productId
    );

    await wishlist.save();

    res.status(200).json({
      products: wishlist.products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove item",
    });
  }
};