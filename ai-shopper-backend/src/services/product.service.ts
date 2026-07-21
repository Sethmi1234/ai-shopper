import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { AppError } from "../utils/AppError";

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "rating";
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

// ── In-memory category cache with 5-minute TTL ─────────────────────────────

interface CacheEntry {
  data: any[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(key: string): boolean {
  const entry = cache.get(key);
  return entry !== undefined && Date.now() < entry.expiresAt;
}

function setCache(key: string, data: any[]): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function invalidateCache(key: string): void {
  cache.delete(key);
}

// ── Sort helpers ────────────────────────────────────────────────────────────

type SortSpec = Record<string, 1 | -1>;

function buildSortOption(sort?: string): SortSpec {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating":
      return { rating: -1 };
    default:
      return {};
  }
}

// ── Service functions ───────────────────────────────────────────────────────

/**
 * Get a paginated list of products with optional category, text-search, and sort filters.
 * Pagination and sorting are handled entirely in the database — never in memory.
 */
export const getProducts = async ({
  page = 1,
  limit = 20,
  category,
  search,
  sort,
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
  const sortOption = buildSortOption(sort);

  // When using text search + sort, MongoDB needs a $meta sort expression
  let query = Product.find(filter).skip(skip).limit(limit).lean();

  if (search && sort === "rating") {
    // Keep text relevance default but apply rating as secondary sort
    query = query.sort({ rating: -1 } as any);
  } else if (Object.keys(sortOption).length > 0) {
    query = query.sort(sortOption as any);
  }

  const [total, items] = await Promise.all([
    Product.countDocuments(filter),
    query,
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
export const getProductById = async (id: string): Promise<any> => {
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return product;
};

/**
 * Update a product by its MongoDB _id.
 * Only allows updating safe admin fields (stock, price).
 */
export const updateProduct = async (
  id: string,
  updates: { price?: number; stock?: number }
): Promise<any | null> => {
  const allowed: Record<string, any> = {};
  if (updates.price !== undefined) allowed.price = updates.price;
  if (updates.stock !== undefined) allowed.stock = updates.stock;

  if (Object.keys(allowed).length === 0) {
    return null; // nothing to update
  }

  const updated = await Product.findByIdAndUpdate(id, { $set: allowed }, { new: true }).lean();
  
  if (!updated) {
    throw new AppError(404, "Product not found");
  }

  return updated;
};

/**
 * Get all categories stored in the database.
 * Results are cached in memory for 5 minutes to avoid hitting the DB on every browse request.
 */
export const getCategories = async (): Promise<any[]> => {
  const CACHE_KEY = "categories";

  if (isCacheValid(CACHE_KEY)) {
    return cache.get(CACHE_KEY)!.data;
  }

  const categories = await Category.find({}).lean();
  setCache(CACHE_KEY, categories);
  return categories;
};

/**
 * Invalidate the category cache (call after a category mutation if needed).
 */
export const invalidateCategories = (): void => {
  invalidateCache("categories");
};
