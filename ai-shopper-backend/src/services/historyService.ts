import crypto from "crypto";
import Chat, { IChatMessage } from "../models/chat.model";

export interface ConversationSummary {
  id: string;
  sessionId: string;
  title: string;
  messageCount: number;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDetail {
  id: string;
  sessionId: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const generateSessionId = (): string => crypto.randomUUID();

export const getOrCreateChat = async (
  userId: string,
  sessionId?: string
): Promise<{ sessionId: string; isNew: boolean }> => {
  if (sessionId) {
    const existing = await Chat.findOne({ userId, sessionId });
    if (existing) {
      return { sessionId: existing.sessionId, isNew: false };
    }
  }

  const newSessionId = sessionId || generateSessionId();
  await Chat.create({
    userId,
    sessionId: newSessionId,
    title: "New conversation",
    messages: [],
  });

  return { sessionId: newSessionId, isNew: true };
};

export const appendMessages = async (
  userId: string,
  sessionId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<void> => {
  if (messages.length === 0) return;

  const chat = await Chat.findOne({ userId, sessionId });
  if (!chat) return;

  const timestamped: IChatMessage[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: new Date(),
  }));

  chat.messages.push(...timestamped);

  const firstUserMessage = chat.messages.find((m) => m.role === "user");
  if (firstUserMessage && chat.title === "New conversation") {
    chat.title =
      firstUserMessage.content.length > 60
        ? `${firstUserMessage.content.slice(0, 57)}...`
        : firstUserMessage.content;
  }

  await chat.save();
};

export const getConversationHistory = async (
  userId: string,
  sessionId: string
): Promise<IChatMessage[]> => {
  const chat = await Chat.findOne({ userId, sessionId }).lean();
  return chat?.messages ?? [];
};

export const listConversations = async (
  userId: string
): Promise<ConversationSummary[]> => {
  const chats = await Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .select("sessionId title messages createdAt updatedAt")
    .lean();

  return chats.map((chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    return {
      id: String(chat._id),
      sessionId: chat.sessionId,
      title: chat.title,
      messageCount: chat.messages.length,
      preview: lastMessage?.content?.slice(0, 100) ?? "",
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  });
};

export const getConversation = async (
  userId: string,
  id: string
): Promise<ConversationDetail | null> => {
  const chat = await Chat.findOne({
    userId,
    $or: [{ _id: id }, { sessionId: id }],
  }).lean();

  if (!chat) return null;

  return {
    id: String(chat._id),
    sessionId: chat.sessionId,
    title: chat.title,
    messages: chat.messages,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
};

export const deleteConversation = async (
  userId: string,
  id: string
): Promise<boolean> => {
  const result = await Chat.deleteOne({
    userId,
    $or: [{ _id: id }, { sessionId: id }],
  });
  return result.deletedCount > 0;
};

export const clearAllConversations = async (userId: string): Promise<number> => {
  const result = await Chat.deleteMany({ userId });
  return result.deletedCount;
};
