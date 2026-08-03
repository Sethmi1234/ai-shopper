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
  "televisions",
  "audio",
  "gaming",
  "headphones",
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
  eat: "groceries",
  meal: "groceries",
  meals: "groceries",
  breakfast: "groceries",
  lunch: "groceries",
  dinner: "groceries",
  fruit: "groceries",
  fruits: "groceries",
  vegetable: "groceries",
  vegetables: "groceries",
  rice: "groceries",
  bread: "groceries",
  milk: "groceries",
  egg: "groceries",
  eggs: "groceries",
  ingredient: "groceries",
  ingredients: "groceries",
  hungry: "groceries",

  // Phones
  phone: "smartphones",
  phones: "smartphones",
  mobile: "smartphones",
  mobiles: "smartphones",
  smartphone: "smartphones",
  smartphones: "smartphones",
  iphone: "smartphones",
  android: "smartphones",
  cell: "smartphones",

  // Computers & Laptops
  laptop: "laptops",
  laptops: "laptops",
  computer: "laptops",
  computers: "laptops",
  notebook: "laptops",
  notebooks: "laptops",
  pc: "laptops",
  desktop: "laptops",
  gaming: "gaming",

  // Tablets
  tablet: "tablets",
  tablets: "tablets",
  ipad: "tablets",

  // Televisions & Monitors
  tv: "televisions",
  television: "televisions",
  televisions: "televisions",
  monitor: "televisions",
  monitors: "televisions",
  screen: "televisions",
  display: "televisions",

  // Audio
  headphone: "headphones",
  headphones: "headphones",
  earphone: "headphones",
  earphones: "headphones",
  earbuds: "headphones",
  earbud: "headphones",
  audio: "audio",
  speaker: "audio",
  speakers: "audio",
  sound: "audio",
  music: "audio",

  // Gadgets / Electronics (general)
  gadget: "smartphones",
  gadgets: "smartphones",
  electronics: "smartphones",
  electronic: "smartphones",

  // Clothing & Fashion
  shirt: "tops",
  shirts: "tops",
  tshirt: "tops",
  "t-shirts": "tops",
  top: "tops",
  tops: "tops",
  clothes: "tops",
  clothing: "tops",
  fashion: "tops",
  outfit: "tops",
  outfits: "tops",
  dress: "womens-dresses",
  dresses: "womens-dresses",
  bag: "womens-bags",
  bags: "womens-bags",
  handbag: "womens-bags",
  jewellery: "womens-jewellery",
  jewelry: "womens-jewellery",
  necklace: "womens-jewellery",
  "mens-shirt": "mens-shirts",

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

  // Skincare & Beauty
  skincare: "skin-care",
  "skin-care": "skin-care",
  "skin care": "skin-care",
  beauty: "beauty",
  cream: "beauty",
  creams: "beauty",
  lotion: "skin-care",
  lotions: "skin-care",
  "face wash": "beauty",
  facewash: "beauty",
  cleanser: "beauty",
  moisturizer: "skin-care",
  serum: "skin-care",
  makeup: "beauty",
  lipstick: "beauty",
  mascara: "beauty",

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

  // Sports
  sport: "sports-accessories",
  sports: "sports-accessories",
  fitness: "sports-accessories",
  gym: "sports-accessories",

  // Gift (mapped to general for keyword lookup; intent handler picks multiple)
  gift: "general",
  gifts: "general",
  present: "general",
  presents: "general",
};

/** Map intent types to MongoDB category slugs */
export const INTENT_CATEGORY_MAP: Record<string, string[]> = {
  food: ["groceries"],
  groceries: ["groceries"],
  skincare: ["skin-care", "beauty"],
  fashion: ["tops", "womens-dresses", "mens-shirts", "mens-shoes", "womens-bags", "womens-jewellery"],
  electronics: ["laptops", "smartphones", "tablets", "headphones", "audio", "gaming"],
  gift: ["fragrances", "watches", "womens-jewellery", "womens-bags", "beauty"],
  product_search: ["groceries", "smartphones", "laptops", "tops", "fragrances", "furniture", "skin-care", "sunglasses", "watches", "mens-shoes", "automotive", "home-decoration", "lighting", "motorcycle", "womens-bags", "womens-dresses", "mens-shirts", "tablets", "sports-accessories", "womens-jewellery", "beauty", "televisions", "audio", "gaming", "headphones"],
};

export const mapKeywordToCategory = (keyword: string): string => {
  const normalized = keyword.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || "general";
};

/** Map multi-word phrases in a message to categories */
export const extractCategoriesFromMessage = (message: string): string[] => {
  const text = message.toLowerCase();
  const found = new Set<string>();

  // Check multi-word phrases first
  const phrases = ["face wash", "skin care", "home decoration", "t-shirts"];
  for (const phrase of phrases) {
    if (text.includes(phrase)) {
      const cat = CATEGORY_MAP[phrase];
      if (cat && cat !== "general") found.add(cat);
    }
  }

  const words = text.replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  for (const word of words) {
    const cat = mapKeywordToCategory(word);
    if (cat !== "general") found.add(cat);
  }

  return [...found];
};

export const mapIntentToCategories = (intent: string): string[] => {
  return INTENT_CATEGORY_MAP[intent] ?? [];
};