import { Product } from "../models/Product";

export class ProductRepository {
  async find(filter: any, skip: number, limit: number, sortOption: any) {
    let query = Product.find(filter).skip(skip).limit(limit).lean();
    if (Object.keys(sortOption).length > 0) {
      query = query.sort(sortOption as any);
    }
    return query.exec();
  }

  async countDocuments(filter: any) {
    return Product.countDocuments(filter);
  }

  async findById(id: string) {
    return Product.findById(id).lean();
  }

  async updateById(id: string, updates: any) {
    return Product.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  }
}
