// Repositories
import { CartRepository } from "./repositories/cart.repository";
import { ProductRepository } from "./repositories/product.repository";
import { CategoryRepository } from "./repositories/category.repository";
import { OrderRepository } from "./repositories/order.repository";
import { WishlistRepository } from "./repositories/wishlist.repository";

// Services
import { CartService } from "./services/cart.service";
import { ProductService } from "./services/product.service";
import { OrderService } from "./services/order.service";
import { WishlistService } from "./services/wishlist.service";

// Controllers
import { CartController } from "./controllers/cart.controller";
import { ProductController } from "./controllers/product.controller";
import { OrderController } from "./controllers/order.controller";
import { WishlistController } from "./controllers/wishlist.controller";

// Instantiate repositories
export const cartRepository = new CartRepository();
export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const orderRepository = new OrderRepository();
export const wishlistRepository = new WishlistRepository();

// Instantiate services
export const cartService = new CartService(cartRepository);
export const productService = new ProductService(productRepository, categoryRepository);
export const orderService = new OrderService(orderRepository, cartRepository);
export const wishlistService = new WishlistService(wishlistRepository);

// Instantiate controllers
export const cartController = new CartController(cartService);
export const productController = new ProductController(productService);
export const orderController = new OrderController(orderService);
export const wishlistController = new WishlistController(wishlistService);
