import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  getChatHistory,
  getChatConversation,
  deleteChatConversation,
  clearChatHistory,
} from "../controllers/chat.controller";

const router = Router();

router.use(protect);

router.get("/history", getChatHistory);
router.get("/history/:id", getChatConversation);
router.delete("/history/:id", deleteChatConversation);
router.delete("/history", clearChatHistory);

export default router;
