import { Product } from "../models/Product";
import { Category } from "../models/Category";

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface PaginatedProducts {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get a paginated list of products with optional category and text-search filters.
 * Pagination is handled entirely in the database (skip/limit) — never in memory.
 */
export const getProducts = async ({
  page = 1,
  limit = 20,
  category,
  search,
}: ProductQuery): Promise<PaginatedProducts> => {
  const filter: Record<string, any> = {};

  if (category) {
    filter.category = category;
  }

  if (search) {
    // Uses the compound text index on title + description
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).skip(skip).limit(limit).lean(),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single product by its MongoDB _id.
 */
export const getProductById = async (id: string): Promise<any | null> => {
  return Product.findById(id).lean();
};

/**
 * Get all categories stored in the database.
 */
export const getCategories = async (): Promise<any[]> => {
  return Category.find({}).lean();
};
