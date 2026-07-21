import Wishlist from "../models/wishlist.model";
import { AppError } from "../utils/AppError";

export interface AddWishlistItemData {
  productId: string;
  title: string;
  price: number;
  thumbnail: string;
}

export interface WishlistResult {
  products: any[];
}

export const getWishlist = async (userId: string): Promise<WishlistResult> => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  return { products: wishlist.products };
};

export const addToWishlist = async (
  userId: string,
  data: AddWishlistItemData
): Promise<WishlistResult> => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  const exists = wishlist.products.some(
    (item) => item.productId === data.productId
  );

  if (exists) {
    return { products: wishlist.products };
  }

  wishlist.products.push({
    productId: data.productId,
    title: data.title,
    price: data.price,
    thumbnail: data.thumbnail,
  } as any);

  await wishlist.save();

  return { products: wishlist.products };
};

export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistResult> => {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new AppError(404, "Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(
    (item) => item.productId !== productId
  );

  await wishlist.save();

  return { products: wishlist.products };
};

export const clearWishlistByUser = async (
  userId: string
): Promise<WishlistResult> => {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (wishlist) {
    wishlist.products = [];
    await wishlist.save();
  }

  return { products: [] };
};