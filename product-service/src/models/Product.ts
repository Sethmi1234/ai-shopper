import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description?: string;
  price: number;
  stock: number;
  rating: number;
  thumbnail?: string;
  images: string[];
  brand?: string;
  category: string; // slug reference to Category
  discountPercentage?: number;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags: string[];
  reviews: Array<{
    rating?: number;
    comment?: string;
    date?: Date;
    reviewerName?: string;
    reviewerEmail?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title:       { type: String, required: true },
    description: { type: String },
    price:       { type: Number, required: true },
    stock:       { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    thumbnail:   { type: String },
    images:      [String],
    brand:       { type: String },
    category:    { type: String, required: true },
    discountPercentage: { type: Number, default: 0 },
    sku: { type: String },
    weight: { type: Number },
    warrantyInformation: { type: String },
    shippingInformation: { type: String },
    returnPolicy: { type: String },
    tags: [String],
    reviews: [
      {
        rating: { type: Number },
        comment: { type: String },
        date: { type: Date },
        reviewerName: { type: String },
        reviewerEmail: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Index for category filtering — prevents full collection scans on every browse request
productSchema.index({ category: 1 });

// Compound text index for full-text search across title and description
productSchema.index({ title: "text", description: "text" });

export const Product = model<IProduct>("Product", productSchema);
