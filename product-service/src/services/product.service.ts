import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../utils/AppError";
import { ProductQueryDto, PaginatedProductsDto } from "../dto/product.dto";

interface CacheEntry {
  data: any[];
  expiresAt: number;
}

export class ProductService {
  private cache = new Map<string, CacheEntry>();
  private CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository
  ) {}

  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && Date.now() < entry.expiresAt;
  }

  private setCache(key: string, data: any[]): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.CACHE_TTL_MS });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private buildSortOption(sort?: string): Record<string, 1 | -1> {
    switch (sort) {
      case "price_asc":
        return { price: 1 };
      case "price_desc":
        return { price: -1 };
      case "rating":
        return { rating: -1 };
      default:
        return {};
    }
  }

  async getProducts({
    page = 1,
    limit = 20,
    category,
    search,
    sort,
  }: ProductQueryDto): Promise<PaginatedProductsDto> {
    const filter: Record<string, any> = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const baseSortOption = this.buildSortOption(sort);
    
    let sortOption: any = baseSortOption;
    if (search && sort === "rating") {
      sortOption = { rating: -1 };
    }

    const [total, items] = await Promise.all([
      this.productRepository.countDocuments(filter),
      this.productRepository.find(filter, skip, limit, sortOption),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    return product;
  }

  async updateProduct(
    id: string,
    updates: { price?: number; stock?: number }
  ): Promise<any | null> {
    const allowed: Record<string, any> = {};
    if (updates.price !== undefined) allowed.price = updates.price;
    if (updates.stock !== undefined) allowed.stock = updates.stock;

    if (Object.keys(allowed).length === 0) {
      return null;
    }

    const updated = await this.productRepository.updateById(id, allowed);

    if (!updated) {
      throw new AppError(404, "Product not found");
    }

    return updated;
  }

  async getCategories(): Promise<any[]> {
    const CACHE_KEY = "categories";

    if (this.isCacheValid(CACHE_KEY)) {
      return this.cache.get(CACHE_KEY)!.data;
    }

    const categories = await this.categoryRepository.findAll();
    this.setCache(CACHE_KEY, categories);
    return categories;
  }

  invalidateCategories(): void {
    this.invalidateCache("categories");
  }
}
