/**
 * Category mapping for AI intent classification
 * Maps user keywords to DummyJSON category slugs
 */

export const CATEGORY_MAP: Record<string, string> = {
  // Food & Groceries
  food: "groceries",
  foods: "groceries",
  snack: "groceries",
  snacks: "groceries",
  drink: "groceries",
  drinks: "groceries",
  grocery: "groceries",
  groceries: "groceries",
  beverage: "groceries",
  beverages: "groceries",

  // Electronics - Phones
  phone: "smartphones",
  phones: "smartphones",
  mobile: "smartphones",
  smartphone: "smartphones",
  smartphones: "smartphones",
  iphone: "smartphones",
  android: "smartphones",
  samsung: "smartphones",

  // Electronics - Laptops
  laptop: "laptops",
  laptops: "laptops",
  computer: "laptops",
  notebook: "laptops",
  macbook: "laptops",

  // Clothing - Tops
  clothes: "tops",
  clothing: "tops",
  shirt: "tops",
  shirts: "tops",
  tshirt: "tops",
  "t-shirts": "tops",
  top: "tops",

  // Fragrances
  perfume: "fragrances",
  perfumes: "fragrances",
  fragrance: "fragrances",
  scent: "fragrances",
  cologne: "fragrances",

  // Furniture
  furniture: "furniture",
  desk: "furniture",
  chair: "furniture",
  table: "furniture",
  sofa: "furniture",
  couch: "furniture",
  bed: "furniture",

  // Skincare
  skincare: "skin-care",
  skin: "skin-care",
  beauty: "skin-care",
  cream: "skin-care",
  lotion: "skin-care",
  makeup: "skin-care",

  // Sunglasses
  sunglasses: "sunglasses",
  glasses: "sunglasses",
  shades: "sunglasses",

  // Watches
  watch: "watches",
  watches: "watches",

  // Shoes
  shoe: "mens-shoes",
  shoes: "mens-shoes",
  sneaker: "mens-shoes",
  sneakers: "mens-shoes",
  footwear: "mens-shoes",

  // Automotive
  car: "automotive",
  auto: "automotive",
  vehicle: "automotive",

  // Home Decoration
  home: "home-decoration",
  decor: "home-decoration",
  decoration: "home-decoration",

  // Lighting
  light: "lighting",
  lighting: "lighting",
  lamp: "lighting",

  // Motorcycle
  motorcycle: "motorcycle",
  bike: "motorcycle",

  // Toys & Games (mapped to closest categories)
  toy: "automotive",
  toys: "automotive",
  game: "automotive",
  games: "automotive",
  play: "automotive",
  child: "automotive",
  children: "automotive",
  kids: "automotive",
  kid: "automotive",
  baby: "automotive",
  doll: "automotive",
  puzzle: "automotive",
  lego: "automotive",
};

/**
 * Allowed DummyJSON categories for classification
 */
export const ALLOWED_CATEGORIES = [
  "groceries",
  "smartphones",
  "laptops",
  "tops",
  "fragrances",
  "furniture",
  "skin-care",
  "sunglasses",
  "watches",
  "mens-shoes",
  "automotive",
  "home-decoration",
  "lighting",
  "motorcycle",
  "general",
] as const;

export type CategoryType = (typeof ALLOWED_CATEGORIES)[number];

/**
 * Maps a keyword to a category using the CATEGORY_MAP
 */
export function mapKeywordToCategory(keyword: string): CategoryType {
  const normalized = keyword.toLowerCase().trim();
  return (CATEGORY_MAP[normalized] || "general") as CategoryType;
}
