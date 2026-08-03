import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  slug: string;
  name: string;
}

const categorySchema = new Schema<ICategory>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export const Category = model<ICategory>("Category", categorySchema);
