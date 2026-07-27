import Wishlist from "../models/wishlist.model";

export class WishlistRepository {
  async findByUserId(userId: string) {
    return Wishlist.findOne({ user: userId });
  }

  async create(wishlistData: any) {
    return Wishlist.create(wishlistData);
  }

  async save(wishlistDocument: any) {
    return wishlistDocument.save();
  }
}
