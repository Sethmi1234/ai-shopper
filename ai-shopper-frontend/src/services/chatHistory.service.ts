import api from "../lib/axios";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationSummary {
  id: string;
  sessionId: string;
  title: string;
  messageCount: number;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail {
  id: string;
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const getChatHistory = async (): Promise<{ conversations: ConversationSummary[] }> => {
  const res = await api.get("/chat/history");
  return res.data;
};

export const getChatConversation = async (id: string): Promise<{ conversation: ConversationDetail }> => {
  const res = await api.get(`/chat/history/${id}`);
  return res.data;
};

export const deleteChatConversation = async (id: string): Promise<void> => {
  await api.delete(`/chat/history/${id}`);
};

export const clearAllChatHistory = async (): Promise<void> => {
  await api.delete("/chat/history");
};