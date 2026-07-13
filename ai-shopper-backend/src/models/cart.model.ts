import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICartItem {
  _id?: Types.ObjectId;
  productId: string;
  title?: string;
  price?: number;
  quantity: number;
  thumbnail?: string;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: Types.DocumentArray<ICartItem>;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    price: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    thumbnail: {
      type: String,
    },
  },
  { _id: true }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICart>("Cart", cartSchema);