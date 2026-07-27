import { Router } from "express";

import { authController } from "../container";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh", authController.refresh);

router.get("/me", protect, authController.getMe);

export default router;