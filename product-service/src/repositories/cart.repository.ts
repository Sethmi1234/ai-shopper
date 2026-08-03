import Cart from "../models/cart.model";

export class CartRepository {
  async findByUserId(userId: string) {
    return Cart.findOne({ user: userId });
  }

  async create(cartData: any) {
    const cart = new Cart(cartData);
    return cart.save();
  }

  async save(cartDocument: any) {
    return cartDocument.save();
  }
}
