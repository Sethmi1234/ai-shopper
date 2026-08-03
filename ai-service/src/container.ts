// Repositories
import { ChatRepository } from "./repositories/chat.repository";

// Services
import { AiService } from "./services/ai.service";
import { AiRateLimitService } from "./services/aiRateLimit.service";
import { AiRouterService } from "./services/aiRouter";
import { ChatService } from "./services/chatService";
import { HistoryService } from "./services/historyService";
import { ProductService } from "./services/product.service";

// Controllers
import { AiController } from "./controllers/ai.controller";
import { ChatController } from "./controllers/chat.controller";

// Instantiate repositories
export const chatRepository = new ChatRepository();

// Instantiate services
export const productService = new ProductService();
export const historyService = new HistoryService(chatRepository);
export const aiRateLimitService = new AiRateLimitService();
export const aiService = new AiService(productService);
export const aiRouterService = new AiRouterService(aiService);
export const chatService = new ChatService(productService, aiService, aiRouterService, historyService);

// Instantiate controllers
export const aiController = new AiController(aiService);
export const chatController = new ChatController(historyService);
