import express from "express";
import {
  listProducts,
  listCategories,
  getProduct,
} from "../controllers/product.controller";

const router = express.Router();

// GET /products/categories — must come before /:id or "categories" will be parsed as an id
router.get("/categories", listCategories);

// GET /products?page=1&limit=20&category=smartphones&search=apple
router.get("/", listProducts);

// GET /products/:id
router.get("/:id", getProduct);

export default router;
