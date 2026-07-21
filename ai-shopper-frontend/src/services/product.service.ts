import api from "../lib/axios";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedProducts {
  data: Product[];
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total: number;
  skip: number;
  limit: number;
}

export interface Product {
  _id: string;
  id: string; // normalised alias — set equal to _id after fetch
  title: string;
  description?: string;
  price: number;
  stock: number;
  rating: number;
  thumbnail?: string;
  images: string[];
  brand?: string;
  category: string;
  discountPercentage?: number;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags?: string[];
  reviews?: Array<{
    rating?: number;
    comment?: string;
    date?: string;
    reviewerName?: string;
    reviewerEmail?: string;
  }>;
  reviewsCount?: number;
}

export type ProductSearchSpec = {
  category?: string | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  brand?: string | null;
  query?: string | null;
  color?: string | null;
  purpose?: string | null;
  keywords?: string[] | null;
};

// ── Normalisation helpers ────────────────────────────────────────────────────

/** Ensure every product has an `id` string alias for `_id` */
function normaliseProduct(p: any): Product {
  return { ...p, id: String(p._id || p.id) };
}

// ── Core API functions ───────────────────────────────────────────────────────

/**
 * Get paginated products from our own backend.
 * Replaces: dummyApi.get("/products?limit=...&skip=...")
 */
export const getProducts = async (
  limit = 20,
  skip = 0,
  category?: string,
  search?: string
): Promise<PaginatedProducts> => {
  const page = Math.floor(skip / limit) + 1;
  const params: Record<string, any> = { page, limit };
  if (category) params.category = category;
  if (search)   params.search = search;

  const res = await api.get("/products", { params });
  const rawData = res.data;
  const products = (rawData.data || []).map(normaliseProduct);
  const pagination = rawData.pagination || {
    page,
    limit,
    total: products.length,
    totalPages: 1,
  };

  return {
    data: products,
    products,
    pagination,
    total: pagination.total,
    skip,
    limit: pagination.limit,
  };
};

/**
 * Get a single product by its MongoDB _id.
 * Replaces: dummyApi.get("/products/:id")
 */
export const getProductById = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return normaliseProduct(res.data);
};

/**
 * Get all categories from our own backend.
 * Replaces: dummyApi.get("/products/categories")
 */
export const getCategories = async (): Promise<{ slug: string; name: string }[]> => {
  const res = await api.get("/products/categories");
  return res.data;
};

// ── Category alias map ────────────────────────────────────────────────────────

const CATEGORY_ALIASES: Record<string, string> = {
  skincare: "skin-care",
  "skin care": "skin-care",
  "skin-care": "skin-care",
  laptop: "laptops",
  laptops: "laptops",
  phone: "smartphones",
  phones: "smartphones",
  smartphone: "smartphones",
  smartphones: "smartphones",
  mobile: "smartphones",
  mobiles: "smartphones",
  tech: "laptops",
  gaming: "laptops",
  gift: "womens-bags",
  gifts: "womens-bags",
  desk: "furniture",
  "desk setup": "furniture",
  minimalist: "home-decoration",
  decor: "home-decoration",
  kitchen: "groceries",
  fragrance: "fragrances",
  fragrances: "fragrances",
  watch: "watches",
  watches: "watches",
  bag: "womens-bags",
  bags: "womens-bags",
  dress: "womens-dresses",
  dresses: "womens-dresses",
  shirt: "mens-shirts",
  shirts: "mens-shirts",
  shoe: "mens-shoes",
  shoes: "mens-shoes",
  sunglasses: "sunglasses",
  tablet: "tablets",
  tablets: "tablets",
  grocery: "groceries",
  groceries: "groceries",
  sport: "sports-accessories",
  motorcycle: "motorcycle",
  jewellery: "womens-jewellery",
  jewelry: "womens-jewellery",
  beauty: "beauty",
  "home decoration": "home-decoration",
  tops: "tops",
};

const STOP_WORDS = new Set([
  "for", "the", "a", "an", "and", "or", "to", "of", "in", "on", "with",
  "under", "best", "top", "looking", "need", "want", "like", "please",
  "recommend", "recommendation", "recommendations", "suggest", "suggestion",
  "buy", "show", "showing", "find", "finds", "gift", "gifts",
]);

function normalizeCategory(category?: string | null): string | undefined {
  if (!category) return undefined;
  const key = category.toLowerCase().trim();
  return CATEGORY_ALIASES[key] || key.replace(/\s+/g, "-");
}

function parsePromptToSpec(prompt: string): ProductSearchSpec {
  const text = prompt.toLowerCase();
  const priceMatch =
    text.match(/\b(?:under|below|less than|up to|max|maximum)\s*\$?\s*(\d{2,6})\b/) ||
    text.match(/\$\s?(\d{2,6})/);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

  const rawWords = text.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const keywords = rawWords.filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  let category: string | null = null;
  for (const word of keywords) {
    if (CATEGORY_ALIASES[word]) {
      category = CATEGORY_ALIASES[word];
      break;
    }
  }

  if (!category && keywords.length > 0) {
    const guessed = normalizeCategory(keywords[0]);
    if (guessed) category = guessed;
  }

  return {
    category,
    maxPrice,
    keywords: keywords.length ? keywords.slice(0, 6) : null,
  };
}

function applyLocalFilters(
  products: Product[],
  maxPrice?: number | null,
  keywords?: string[] | null,
  minPrice?: number | null
): Product[] {
  let filtered = products;

  if (maxPrice != null && !Number.isNaN(Number(maxPrice))) {
    filtered = filtered.filter((p) => Number(p.price) <= Number(maxPrice));
  }
  if (minPrice != null && !Number.isNaN(Number(minPrice))) {
    filtered = filtered.filter((p) => Number(p.price) >= Number(minPrice));
  }
  if (keywords?.length) {
    filtered = filtered.filter((p) => {
      const text = `${p.title} ${p.description || ""} ${p.category || ""}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw.toLowerCase()));
    });
  }

  return filtered;
}

// ── Spec-based search ────────────────────────────────────────────────────────

/**
 * Search products by a structured spec.
 * Tries category + keyword filters against our own backend; falls back to
 * full-text search, then a broad fetch with client-side filtering.
 */
export const searchProductsBySpec = async (
  spec: ProductSearchSpec
): Promise<{ products: Product[] }> => {
  const { maxPrice, minPrice } = spec;
  const category = normalizeCategory(spec.category);
  const keywordParts = [
    ...(spec.keywords || []),
    spec.brand,
    spec.query,
    spec.color,
    spec.purpose,
  ]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .flatMap((item) => item.toLowerCase().split(/\s+/))
    .filter((item) => item.length > 2 && !STOP_WORDS.has(item));
  const keywords = Array.from(new Set(keywordParts));

  // 1. Try category search with our backend
  if (category) {
    try {
      const result = await getProducts(50, 0, category);
      const categoryProducts = result.data;
      const filtered = applyLocalFilters(categoryProducts, maxPrice, keywords, minPrice);
      if (filtered.length > 0) return { products: filtered };

      const priceOnly = applyLocalFilters(categoryProducts, maxPrice, null, minPrice);
      if (priceOnly.length > 0) return { products: priceOnly };
    } catch {
      // fall through to text search
    }
  }

  // 2. Try full-text search (uses MongoDB text index)
  const searchQuery = keywords.length ? keywords.join(" ") : category || "";
  if (searchQuery) {
    try {
      const result = await getProducts(50, 0, undefined, searchQuery);
      const filtered = applyLocalFilters(result.data, maxPrice, keywords, minPrice);
      if (filtered.length > 0) return { products: filtered };
    } catch {
      // fall through to broad fetch
    }
  }

  // 3. Broad fetch — pull 100 products and filter client-side
  const result = await getProducts(100, 0);
  const filtered = applyLocalFilters(result.data, maxPrice, keywords, minPrice);
  if (filtered.length > 0) return { products: filtered };

  // Last resort — price-only filter across all fetched products
  return { products: applyLocalFilters(result.data, maxPrice, null, minPrice) };
};

/**
 * Parse a free-text prompt into a ProductSearchSpec and search.
 */
export const searchProductsByPrompt = async (
  prompt: string
): Promise<{ products: Product[] }> => {
  const spec = parsePromptToSpec(prompt);
  return searchProductsBySpec(spec);
};
