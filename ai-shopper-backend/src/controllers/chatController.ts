import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  listConversations,
  getConversation,
  deleteConversation,
  clearAllConversations,
} from "../services/historyService";
import { AppError } from "../utils/AppError";

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversations = await listConversations(req.user!.id);
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const conversation = await getConversation(req.user!.id, id);

    if (!conversation) {
      throw new AppError(404, "Conversation not found");
    }

    res.json({ conversation });
  } catch (error) {
    next(error);
  }
};

export const deleteChatById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const deleted = await deleteConversation(req.user!.id, id);

    if (!deleted) {
      throw new AppError(404, "Conversation not found");
    }

    res.json({ message: "Conversation deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await clearAllConversations(req.user!.id);
    res.json({ message: "All conversations cleared", deletedCount: count });
  } catch (error) {
    next(error);
  }
};
