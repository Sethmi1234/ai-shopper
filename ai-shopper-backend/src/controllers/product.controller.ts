import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  constructor(private productService: ProductService) {}

  /**
   * GET /products
   * Returns a paginated product list.
   * Query params: page, limit, category, search, sort (price_asc|price_desc|rating)
   */
  listProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const sort = req.query.sort as "price_asc" | "price_desc" | "rating" | undefined;

      const validSorts = ["price_asc", "price_desc", "rating"];
      const sanitizedSort = sort && validSorts.includes(sort) ? sort : undefined;

      const result = await this.productService.getProducts({ page, limit, category, search, sort: sanitizedSort });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/categories
   * Returns all categories. Must be declared before /:id to avoid "categories" being treated as an id.
   */
  listCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categories = await this.productService.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/:id
   * Returns a single product by its MongoDB _id.
   */
  getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const product = await this.productService.getProductById(String(req.params.id));
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /products/:id
   * Admin route to update a product's stock and/or price without re-seeding.
   * Body: { price?: number, stock?: number }
   */
  updateProductHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { price, stock } = req.body;

      const product = await this.productService.updateProduct(String(req.params.id), { price, stock });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({ message: "Product updated", product });
    } catch (error) {
      next(error);
    }
  };
}
