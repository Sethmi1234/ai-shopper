import Cart from "../models/cart.model";

export interface AddItemData {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface UpdateItemData {
  quantity: number;
}

export interface CartResult {
  items: any[];
}

export const getCart = async (userId: string): Promise<CartResult> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return { items: [] };
  }

  return { items: cart.items };
};

export const addItemToCart = async (userId: string, data: AddItemData): Promise<CartResult> => {
  let cart = await Cart.findOne({ user: userId });

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

  await cart.save();
  return { items: cart.items };
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  data: UpdateItemData
): Promise<CartResult> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
  }

  const item = (cart.items as any).id(itemId);

  if (!item) {
    throw Object.assign(new Error("Item not found in cart"), { statusCode: 404 });
  }

  item.quantity = data.quantity;
  await cart.save();

  return { items: cart.items };
};

export const removeCartItem = async (userId: string, itemId: string): Promise<CartResult> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
  }

  (cart.items as any).pull(itemId);
  await cart.save();

  return { items: cart.items };
};

export const clearCartByUser = async (userId: string): Promise<CartResult> => {
  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = [] as any;
    await cart.save();
  }

  return { items: [] };
};