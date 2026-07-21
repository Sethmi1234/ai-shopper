import { Request, Response, NextFunction } from "express";
import {
  getProducts,
  getProductById,
  getCategories,
} from "../services/product.service";

/**
 * GET /products
 * Returns a paginated product list.
 * Query params: page, limit, category, search
 */
export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const category = req.query.category as string | undefined;
    const search   = req.query.search   as string | undefined;

    const result = await getProducts({ page, limit, category, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /products/categories
 * Returns all categories. Must be declared before /:id to avoid "categories" being treated as an id.
 */
export const listCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /products/:id
 * Returns a single product by its MongoDB _id.
 */
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await getProductById(String(req.params.id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    // If the id is not a valid ObjectId, mongoose throws a CastError
    if ((error as any).name === "CastError") {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }
    next(error);
  }
};
