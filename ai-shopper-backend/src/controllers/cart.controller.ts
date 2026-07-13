import { Response } from "express";
import Cart from "../models/cart.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { addItemSchema, updateItemSchema } from "../validators/cart.validator";

// GET /cart - Get current user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json({ items: cart.items });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// POST /cart/items - Add item to cart
export const addItem = async (req: AuthRequest, res: Response) => {
  try {
    const data = addItemSchema.parse(req.body);

    let cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      cart = new Cart({
        user: req.user?.id,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === data.productId
    );

    if (existingItemIndex > -1) {
      // Update existing item - update ALL fields to ensure old items get required fields
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

    // Save with validation disabled to handle any legacy items
    await cart.save();

    res.json({ items: cart.items });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// PATCH /cart/items/:id - Update item quantity
export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateItemSchema.parse(req.body);
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item by _id in the items array
    const item = (cart.items as any).id(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = data.quantity;
    await cart.save();

    res.json({ items: cart.items });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// DELETE /cart/items/:id - Remove item from cart
export const removeItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Use Mongoose's pull method to remove subdocument by _id
    (cart.items as any).pull(id);
    await cart.save();

    res.json({ items: cart.items });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /cart - Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });

    if (cart) {
      cart.items = [] as any;
      await cart.save();
    }

    res.json({ items: [] });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};