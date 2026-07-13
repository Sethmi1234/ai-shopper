import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: string;
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: String,
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        thumbnail: {
          type: String,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", orderSchema);