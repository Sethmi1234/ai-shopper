// Repositories
import { UserRepository } from "./repositories/user.repository";

// Services
import { AuthService } from "./services/auth.service";

// Controllers
import { AuthController } from "./controllers/auth.controller";

// Instantiate repositories
export const userRepository = new UserRepository();

// Instantiate services
export const authService = new AuthService(userRepository);

// Instantiate controllers
export const authController = new AuthController(authService);
