import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { Category } from "../src/models/Category";

const DUMMYJSON_URL = "https://dummyjson.com";

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to database");

  // Guard: skip if data already exists (idempotent — safe to run twice)
  const productCount = await Product.countDocuments();
  const categoryCount = await Category.countDocuments();

  if (productCount > 0 && categoryCount > 0) {
    console.log(
      `Skipping seed — ${productCount} products and ${categoryCount} categories already exist.`
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Seed categories ──────────────────────────────────────────────────────
  console.log("Seeding categories...");
  const categoriesRes = await fetch(`${DUMMYJSON_URL}/products/categories`);
  if (!categoriesRes.ok) {
    throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
  }
  const categories: Array<{ slug: string; name: string }> =
    await categoriesRes.json();

  if (categoryCount === 0) {
    await Category.insertMany(
      categories.map((c) => ({ slug: c.slug, name: c.name }))
    );
    console.log(`Inserted ${categories.length} categories.`);
  } else {
    console.log(`Skipping categories — ${categoryCount} already exist.`);
  }

  // ── Seed products ────────────────────────────────────────────────────────
  // DummyJSON caps at 194 products total — fetch with a generous limit
  console.log("Seeding products...");
  const productsRes = await fetch(
    `${DUMMYJSON_URL}/products?limit=200&skip=0`
  );
  if (!productsRes.ok) {
    throw new Error(`Failed to fetch products: ${productsRes.status}`);
  }
  const { products } = await productsRes.json();

  await Product.insertMany(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products.map((p: any) => ({
      title:       p.title,
      description: p.description,
      price:       p.price,
      stock:       p.stock ?? 0,
      rating:      p.rating ?? 0,
      thumbnail:   p.thumbnail,
      images:      p.images ?? [],
      brand:       p.brand,
      category:    p.category,
      discountPercentage: p.discountPercentage ?? 0,
      sku: p.sku,
      weight: p.weight,
      warrantyInformation: p.warrantyInformation,
      shippingInformation: p.shippingInformation,
      returnPolicy: p.returnPolicy,
      tags: p.tags ?? [],
      reviews: p.reviews ?? [],
    }))
  );

  console.log(
    `Seeded ${products.length} products across ${categories.length} categories.`
  );

  await mongoose.disconnect();
  console.log("Done. Database disconnected.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
