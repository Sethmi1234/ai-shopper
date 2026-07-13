import api from "../lib/axios";

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

export const getProducts = async (limit?: number, skip?: number) => {
  const queryParts: string[] = [];
  if (limit && limit > 0) queryParts.push(`limit=${limit}`);
  if (skip && skip > 0) queryParts.push(`skip=${skip}`);
  const url = queryParts.length > 0 ? `/products?${queryParts.join("&")}` : "/products";
  const res = await api.get(url);
  return res.data;
};

export const getProductById = async (id: number) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/products/categories");
  return res.data;
};

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
  tech: "mobile-accessories",
  gaming: "laptops",
  gift: "womens-bags",
  gifts: "womens-bags",
  desk: "furniture",
  "desk setup": "furniture",
  minimalist: "home-decoration",
  decor: "home-decoration",
  kitchen: "kitchen-accessories",
  fragrance: "fragrances",
  fragrances: "fragrances",
  watch: "womens-watches",
  watches: "womens-watches",
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
  vehicle: "vehicle",
  jewellery: "womens-jewellery",
  jewelry: "womens-jewellery",
  beauty: "beauty",
  "home decoration": "home-decoration",
};

const STOP_WORDS = new Set([
  "for",
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "with",
  "under",
  "best",
  "top",
  "looking",
  "need",
  "want",
  "like",
  "please",
  "recommend",
  "recommendation",
  "recommendations",
  "suggest",
  "suggestion",
  "buy",
  "show",
  "showing",
  "find",
  "finds",
  "gift",
  "gifts",
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
    if (guessed) {
      category = guessed;
    }
  }

  return {
    category,
    maxPrice,
    keywords: keywords.length ? keywords.slice(0, 6) : null,
  };
}

function filterProducts(
  products: any[],
  maxPrice?: number | null,
  keywords?: string[] | null,
  minPrice?: number | null
) {
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
      return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    });
  }

  return filtered;
}

export const searchProductsBySpec = async (spec: ProductSearchSpec) => {
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

  if (category) {
    try {
      const res = await api.get(`/products/category/${encodeURIComponent(category)}`);
      const categoryProducts = res.data?.products || [];
      const products = filterProducts(categoryProducts, maxPrice, keywords, minPrice);
      if (products.length > 0) return { products };

      const priceOnlyProducts = filterProducts(categoryProducts, maxPrice, null, minPrice);
      if (priceOnlyProducts.length > 0) return { products: priceOnlyProducts };
    } catch {
      // Fall through to search if category slug is invalid
    }
  }

  const q = keywords?.length ? keywords.join(" ") : category || "";
  if (q) {
    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
      const products = filterProducts(res.data?.products || [], maxPrice, keywords, minPrice);
      if (products.length > 0) return { products };
    } catch {
      // Fall through to full catalog search
    }
  }

  const res = await api.get("/products?limit=100");
  const products = filterProducts(res.data?.products || [], maxPrice, keywords, minPrice);
  if (products.length > 0) return { products };
  
  // If keyword match fails completely across the entire catalog, just return price-matched products!
  const priceOnlyProducts = filterProducts(res.data?.products || [], maxPrice, null, minPrice);
  return { products: priceOnlyProducts };
};

export const searchProductsByPrompt = async (prompt: string) => {
  const spec = parsePromptToSpec(prompt);
  return searchProductsBySpec(spec);
};
