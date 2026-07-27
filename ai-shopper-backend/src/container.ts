// Repositories
import { CartRepository } from "./repositories/cart.repository";
import { ProductRepository } from "./repositories/product.repository";
import { CategoryRepository } from "./repositories/category.repository";
import { UserRepository } from "./repositories/user.repository";
import { OrderRepository } from "./repositories/order.repository";
import { WishlistRepository } from "./repositories/wishlist.repository";
import { ChatRepository } from "./repositories/chat.repository";

// Services
import { CartService } from "./services/cart.service";
import { ProductService } from "./services/product.service";
import { AuthService } from "./services/auth.service";
import { OrderService } from "./services/order.service";
import { WishlistService } from "./services/wishlist.service";
import { HistoryService } from "./services/historyService";
import { AiService } from "./services/ai.service";
import { AiRateLimitService } from "./services/aiRateLimit.service";
import { AiRouterService } from "./services/aiRouter";
import { ChatService } from "./services/chatService";

// Controllers
import { CartController } from "./controllers/cart.controller";
import { ProductController } from "./controllers/product.controller";
import { AuthController } from "./controllers/auth.controller";
import { OrderController } from "./controllers/order.controller";
import { WishlistController } from "./controllers/wishlist.controller";
import { AiController } from "./controllers/ai.controller";
import { ChatController } from "./controllers/chat.controller";

// Instantiate repositories
export const cartRepository = new CartRepository();
export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const userRepository = new UserRepository();
export const orderRepository = new OrderRepository();
export const wishlistRepository = new WishlistRepository();
export const chatRepository = new ChatRepository();

// Instantiate services
export const cartService = new CartService(cartRepository);
export const productService = new ProductService(productRepository, categoryRepository);
export const authService = new AuthService(userRepository);
export const orderService = new OrderService(orderRepository, cartRepository);
export const wishlistService = new WishlistService(wishlistRepository);
export const historyService = new HistoryService(chatRepository);
export const aiRateLimitService = new AiRateLimitService();
export const aiService = new AiService(productService);
export const aiRouterService = new AiRouterService(aiService);
export const chatService = new ChatService(productService, aiService, aiRouterService, historyService);

// Instantiate controllers
export const cartController = new CartController(cartService);
export const productController = new ProductController(productService);
export const authController = new AuthController(authService);
export const orderController = new OrderController(orderService);
export const wishlistController = new WishlistController(wishlistService);
export const aiController = new AiController(aiService);
export const chatController = new ChatController(historyService);
