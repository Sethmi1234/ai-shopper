import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { chatController } from "../container";

const router = Router();

router.use(protect);

router.get("/history", chatController.getChatHistory);
router.get("/history/:id", chatController.getChatConversation);
router.delete("/history/:id", chatController.deleteChatConversation);
router.delete("/history", chatController.clearChatHistory);

export default router;
