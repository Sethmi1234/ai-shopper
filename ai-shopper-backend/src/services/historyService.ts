import crypto from "crypto";
import { IChatMessage } from "../models/chat.model";
import { ChatRepository } from "../repositories/chat.repository";
import Chat from "../models/chat.model";

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

export class HistoryService {
  constructor(private chatRepository: ChatRepository) {}

  generateSessionId(): string {
    return crypto.randomUUID();
  }

  async getOrCreateChat(
    userId: string,
    sessionId?: string
  ): Promise<{ sessionId: string; isNew: boolean }> {
    if (sessionId) {
      const existing = await this.chatRepository.findByUserIdAndSessionId(
        userId,
        sessionId
      );
      if (existing) {
        return { sessionId: existing.sessionId, isNew: false };
      }
    }

    const newSessionId = sessionId || this.generateSessionId();
    await this.chatRepository.create({
      userId,
      sessionId: newSessionId,
      title: "New conversation",
      messages: [],
    });

    return { sessionId: newSessionId, isNew: true };
  }

  async appendMessages(
    userId: string,
    sessionId: string,
    messages: Array<{ role: "user" | "assistant"; content: string }>
  ): Promise<void> {
    if (messages.length === 0) return;

    const chat = await this.chatRepository.findByUserIdAndSessionId(
      userId,
      sessionId
    );
    if (!chat) return;

    const timestamped: IChatMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(),
    }));

    chat.messages.push(...timestamped);

    const firstUserMessage = chat.messages.find((m: any) => m.role === "user");
    if (firstUserMessage && chat.title === "New conversation") {
      chat.title =
        firstUserMessage.content.length > 60
          ? `${firstUserMessage.content.slice(0, 57)}...`
          : firstUserMessage.content;
    }

    await this.chatRepository.save(chat);
  }

  async getConversationHistory(
    userId: string,
    sessionId: string
  ): Promise<IChatMessage[]> {
    const chat = await this.chatRepository.findByUserIdAndSessionId(
      userId,
      sessionId
    );
    return chat?.messages ?? [];
  }

  async listConversations(userId: string): Promise<ConversationSummary[]> {
    const chats = await this.chatRepository.findByUserId(userId);

    return chats.map((chat: any) => {
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
  }

  async getConversation(
    userId: string,
    id: string
  ): Promise<ConversationDetail | null> {
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
  }

  async deleteConversation(userId: string, id: string): Promise<boolean> {
    const result = await Chat.deleteOne({
      userId,
      $or: [{ _id: id }, { sessionId: id }],
    });
    return result.deletedCount > 0;
  }

  async clearAllConversations(userId: string): Promise<number> {
    const result = await this.chatRepository.deleteManyByUserId(userId);
    return result.deletedCount;
  }
}
