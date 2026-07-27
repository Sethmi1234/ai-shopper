import { WishlistRepository } from "../repositories/wishlist.repository";
import { AppError } from "../utils/AppError";
import { AddWishlistItemDto, WishlistResultDto } from "../dto/wishlist.dto";

export class WishlistService {
  constructor(private wishlistRepository: WishlistRepository) {}

  async getWishlist(userId: string): Promise<WishlistResultDto> {
    let wishlist = await this.wishlistRepository.findByUserId(userId);

    if (!wishlist) {
      wishlist = await this.wishlistRepository.create({
        user: userId,
        products: [],
      });
    }

    return { products: wishlist.products };
  }

  async addToWishlist(
    userId: string,
    data: AddWishlistItemDto
  ): Promise<WishlistResultDto> {
    let wishlist = await this.wishlistRepository.findByUserId(userId);

    if (!wishlist) {
      wishlist = await this.wishlistRepository.create({
        user: userId,
        products: [],
      });
    }

    const exists = wishlist.products.some(
      (item: any) => item.productId === data.productId
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

    await this.wishlistRepository.save(wishlist);

    return { products: wishlist.products };
  }

  async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<WishlistResultDto> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);

    if (!wishlist) {
      throw new AppError(404, "Wishlist not found");
    }

    wishlist.products = wishlist.products.filter(
      (item: any) => item.productId !== productId
    );

    await this.wishlistRepository.save(wishlist);

    return { products: wishlist.products };
  }

  async clearWishlistByUser(userId: string): Promise<WishlistResultDto> {
    const wishlist = await this.wishlistRepository.findByUserId(userId);

    if (wishlist) {
      wishlist.products = [];
      await this.wishlistRepository.save(wishlist);
    }

    return { products: [] };
  }
}