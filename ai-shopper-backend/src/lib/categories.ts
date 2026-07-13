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
  "womens-bags",
  "womens-dresses",
  "mens-shirts",
  "tablets",
  "sports-accessories",
  "womens-jewellery",
  "beauty",
  "general",
];

export const CATEGORY_MAP: Record<string, string> = {
  // Food & Groceries
  food: "groceries",
  foods: "groceries",
  grocery: "groceries",
  groceries: "groceries",
  snack: "groceries",
  snacks: "groceries",
  drink: "groceries",
  drinks: "groceries",
  beverage: "groceries",
  beverages: "groceries",

  // Phones
  phone: "smartphones",
  phones: "smartphones",
  mobile: "smartphones",
  mobiles: "smartphones",
  smartphone: "smartphones",
  smartphones: "smartphones",
  iphone: "smartphones",
  android: "smartphones",

  // Computers
  laptop: "laptops",
  laptops: "laptops",
  computer: "laptops",
  computers: "laptops",
  notebook: "laptops",
  notebooks: "laptops",
  pc: "laptops",
  desktop: "laptops",

  // Clothing
  shirt: "tops",
  shirts: "tops",
  tshirt: "tops",
  "t-shirts": "tops",
  top: "tops",
  tops: "tops",
  clothes: "tops",
  clothing: "tops",

  // Fragrances
  perfume: "fragrances",
  perfumes: "fragrances",
  fragrance: "fragrances",
  scent: "fragrances",
  scents: "fragrances",
  cologne: "fragrances",

  // Furniture
  furniture: "furniture",
  desk: "furniture",
  desks: "furniture",
  chair: "furniture",
  chairs: "furniture",
  sofa: "furniture",
  sofas: "furniture",
  table: "furniture",
  tables: "furniture",

  // Skincare
  skincare: "skin-care",
  "skin care": "skin-care",
  beauty: "skin-care",
  cream: "skin-care",
  creams: "skin-care",
  lotion: "skin-care",
  lotions: "skin-care",

  // Eyewear
  sunglasses: "sunglasses",
  glasses: "sunglasses",
  shades: "sunglasses",
  eyewear: "sunglasses",

  // Watches
  watch: "watches",
  watches: "watches",
  timepiece: "watches",

  // Shoes
  shoe: "mens-shoes",
  shoes: "mens-shoes",
  sneakers: "mens-shoes",
  footwear: "mens-shoes",
  boots: "mens-shoes",

  // Vehicles
  car: "automotive",
  cars: "automotive",
  auto: "automotive",
  automotive: "automotive",
  vehicle: "automotive",

  // Home
  decor: "home-decoration",
  decoration: "home-decoration",
  "home decoration": "home-decoration",
  "home-decor": "home-decoration",

  // Lighting
  light: "lighting",
  lights: "lighting",
  lamp: "lighting",
  lamps: "lighting",

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

export const mapKeywordToCategory = (keyword: string): string => {
  const normalized = keyword.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || "general";
};
