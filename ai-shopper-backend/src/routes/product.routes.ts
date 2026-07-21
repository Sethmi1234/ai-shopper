import express from "express";
import {
  listProducts,
  listCategories,
  getProduct,
  updateProductHandler,
} from "../controllers/product.controller";

const router = express.Router();

// GET /products/categories — must come before /:id or "categories" will be parsed as an id
router.get("/categories", listCategories);

// GET /products?page=1&limit=20&category=smartphones&search=apple&sort=price_asc
router.get("/", listProducts);

// GET /products/:id
router.get("/:id", getProduct);

// PUT /products/:id — admin route to update stock or price without re-seeding
router.put("/:id", updateProductHandler);

export default router;
