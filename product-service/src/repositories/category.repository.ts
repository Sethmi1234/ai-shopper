import { Category } from "../models/Category";

export class CategoryRepository {
  async findAll() {
    return Category.find({}).lean();
  }
}
