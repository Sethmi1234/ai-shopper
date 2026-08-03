import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { HistoryService } from "../services/historyService";

export class ChatController {
  constructor(private historyService: HistoryService) {}

  // GET /chat/history - Get all conversations for the logged-in user
  getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversations = await this.historyService.listConversations(userId);
      res.status(200).json({ conversations });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  };

  // GET /chat/history/:id - Get a single conversation by ID
  getChatConversation = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversationId = Array.isArray(id) ? id[0] : id;
      const conversation = await this.historyService.getConversation(userId, conversationId as string);

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.status(200).json({ conversation });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  };

  // DELETE /chat/history/:id - Delete a single conversation
  deleteChatConversation = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const conversationId = Array.isArray(id) ? id[0] : id;
      const deleted = await this.historyService.deleteConversation(userId, conversationId as string);

      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  };

  // DELETE /chat/history - Clear all chat history
  clearChatHistory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const deletedCount = await this.historyService.clearAllConversations(userId);

      res.status(200).json({
        message: "Chat history cleared successfully",
        deletedCount,
      });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  };
}
