import mongoose, { Schema, Document } from "mongoose";

export interface IWishlistItem {
  productId: string;
  title: string;
  price: number;
  thumbnail: string;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: IWishlistItem[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
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

        thumbnail: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWishlist>("Wishlist", wishlistSchema);