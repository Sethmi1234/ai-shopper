import express from "express";
import { productController } from "../container";

const router = express.Router();

// GET /products/categories — must come before /:id or "categories" will be parsed as an id
router.get("/categories", productController.listCategories);

// GET /products?page=1&limit=20&category=smartphones&search=apple&sort=price_asc
router.get("/", productController.listProducts);

// GET /products/:id
router.get("/:id", productController.getProduct);

// PUT /products/:id — admin route to update stock or price without re-seeding
router.put("/:id", productController.updateProductHandler);

export default router;
