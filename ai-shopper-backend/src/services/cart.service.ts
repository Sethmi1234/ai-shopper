import { AppError } from "../utils/AppError";
import { AddItemDto, UpdateItemDto, CartResultDto } from "../dto/cart.dto";
import { CartRepository } from "../repositories/cart.repository";
import Cart from "../models/cart.model";

export class CartService {
  constructor(private cartRepository: CartRepository) {}

  async getCart(userId: string): Promise<CartResultDto> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return { items: [] };
    }

    return { items: cart.items };
  }

  async addItemToCart(userId: string, data: AddItemDto): Promise<CartResultDto> {
    let cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === data.productId
    );

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];
      existingItem.quantity += data.quantity;
      existingItem.title = data.title;
      existingItem.price = data.price;
      existingItem.thumbnail = data.thumbnail;
    } else {
      cart.items.push({
        productId: data.productId,
        title: data.title,
        price: data.price,
        quantity: data.quantity,
        thumbnail: data.thumbnail,
      } as any);
    }

    await this.cartRepository.save(cart);
    return { items: cart.items };
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    data: UpdateItemDto
  ): Promise<CartResultDto> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new AppError(404, "Cart not found");
    }

    const item = (cart.items as any).id(itemId);

    if (!item) {
      throw new AppError(404, "Item not found in cart");
    }

    item.quantity = data.quantity;
    await this.cartRepository.save(cart);

    return { items: cart.items };
  }

  async removeCartItem(userId: string, itemId: string): Promise<CartResultDto> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new AppError(404, "Cart not found");
    }

    (cart.items as any).pull(itemId);
    await this.cartRepository.save(cart);

    return { items: cart.items };
  }

  async clearCartByUser(userId: string): Promise<CartResultDto> {
    const cart = await this.cartRepository.findByUserId(userId);

    if (cart) {
      cart.items = [] as any;
      await this.cartRepository.save(cart);
    }

    return { items: [] };
  }
}