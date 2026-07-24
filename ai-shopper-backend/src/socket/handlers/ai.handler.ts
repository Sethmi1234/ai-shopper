import { Socket } from "socket.io";
import { ConversationTurn } from "../../services/ai.service";
import { streamShoppingAssistantResponse, clearSocketMemory, getSocketMemory } from "../../services/chatService";
import { rateLimitCheck } from "../../services/aiRateLimit.service";
import { getConversationHistory, listConversations, deleteConversation } from "../../services/historyService";

interface AiMessagePayload {
  message?: unknown;
  conversationHistory?: unknown;
  sessionId?: unknown;
}

const normalizeConversationHistory = (value: unknown): ConversationTurn[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((turn) => (
      turn &&
      typeof turn === "object" &&
      ((turn as any).role === "user" || (turn as any).role === "assistant") &&
      typeof (turn as any).content === "string"
    ))
    .map((turn) => ({
      role: (turn as any).role,
      content: (turn as any).content,
    }))
    .slice(-15);
};

export const handleAiChat = (socket: Socket) => {
  socket.on("ai:message", async (payload: AiMessagePayload = {}) => {
    const userId = socket.data.user?.id;
    const userName = socket.data.user?.name;
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const sessionId =
      typeof payload.sessionId === "string" && payload.sessionId.trim()
        ? payload.sessionId.trim()
        : undefined;

    if (!userId) {
      socket.emit("ai:error", { message: "Unauthorized connection." });
      return;
    }

    if (!message) {
      socket.emit("ai:error", { message: "Message is required." });
      return;
    }

    if (message.length > 1_000) {
      socket.emit("ai:error", { message: "Message is too long." });
      return;
    }

    const rateLimit = rateLimitCheck(userId);
    if (!rateLimit.allowed) {
      socket.emit("ai:error", {
        message: "Rate limit exceeded. Please wait a moment.",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
      return;
    }

    socket.emit("ai:start");
    socket.emit("ai:typing", { isTyping: true });

    try {
      const result = await streamShoppingAssistantResponse({
        message,
        conversationHistory: normalizeConversationHistory(payload.conversationHistory),
        sessionId,
        userId,
        userName,
        socketId: socket.id,
        onToken: (token) => socket.emit("ai:chunk", { text: token }),
      });

      socket.emit("ai:typing", { isTyping: false });
      socket.emit("ai:done", {
        reply: result.reply,
        products: result.products,
        suggestions: result.suggestions ?? [],
        sessionId: result.sessionId,
      });
      
      // Emit suggested questions separately for UI convenience
      if (result.suggestions && result.suggestions.length > 0) {
        socket.emit("ai:suggestions", { suggestions: result.suggestions });
      }
    } catch (error) {
      console.error("AI socket stream error:", error);
      socket.emit("ai:typing", { isTyping: false });
      socket.emit("ai:error", {
        message:
          "I'm having trouble connecting to the AI service. Please try again in a few moments.",
      });
    }
  });

  // Load conversation history for continuing previous conversations
  socket.on("ai:loadHistory", async (payload: { sessionId?: string }) => {
    const userId = socket.data.user?.id;
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.trim() : undefined;

    if (!userId) {
      socket.emit("ai:error", { message: "Unauthorized connection." });
      return;
    }

    if (!sessionId) {
      socket.emit("ai:error", { message: "Session ID is required." });
      return;
    }

    try {
      const dbHistory = await getConversationHistory(userId, sessionId);
      const history: ConversationTurn[] = dbHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      socket.emit("ai:historyLoaded", {
        sessionId,
        messages: history,
        messageCount: history.length,
      });
    } catch (error) {
      console.error("Error loading conversation history:", error);
      socket.emit("ai:error", {
        message: "Failed to load conversation history.",
      });
    }
  });

  // Get all conversation summaries for the user
  socket.on("ai:getHistoryList", async () => {
    const userId = socket.data.user?.id;

    if (!userId) {
      socket.emit("ai:error", { message: "Unauthorized connection." });
      return;
    }

    try {
      const conversations = await listConversations(userId);
      socket.emit("ai:historyList", { conversations });
    } catch (error) {
      console.error("Error listing conversations:", error);
      socket.emit("ai:historyList", { conversations: [] });
    }
  });

  // Delete a conversation
  socket.on("ai:deleteHistory", async (payload: { sessionId?: string }) => {
    const userId = socket.data.user?.id;
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId.trim() : undefined;

    if (!userId || !sessionId) return;

    try {
      await deleteConversation(userId, sessionId);
      socket.emit("ai:historyDeleted", { sessionId });
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  });

  // Clear socket memory when starting a new conversation
  socket.on("ai:newConversation", () => {
    clearSocketMemory(socket.id);
    socket.emit("ai:conversationCleared");
  });

  // Get suggested questions based on current context
  socket.on("ai:getSuggestions", async () => {
    const userId = socket.data.user?.id;
    
    if (!userId) {
      socket.emit("ai:error", { message: "Unauthorized connection." });
      return;
    }

    try {
      const socketMemory = getSocketMemory(socket.id);
      const lastAssistantMessage = socketMemory
        .filter((turn) => turn.role === "assistant")
        .slice(-1)[0];

      // Default suggestions if no context
      const defaultSuggestions = [
        "Show me laptops",
        "Skincare for dry skin",
        "What should I eat today?",
        "Gift ideas",
      ];

      if (!lastAssistantMessage) {
        socket.emit("ai:suggestions", { suggestions: defaultSuggestions });
        return;
      }

      // Context-aware suggestions based on last response
      const suggestions = [
        "Compare these",
        "Show cheaper options",
        "Show more like these",
        "Different category",
      ];

      socket.emit("ai:suggestions", { suggestions });
    } catch (error) {
      console.error("Error getting suggestions:", error);
      socket.emit("ai:suggestions", {
        suggestions: ["Show me laptops", "Skincare products", "Gift ideas", "Help me choose"],
      });
    }
  });

  socket.on("disconnect", () => {
    clearSocketMemory(socket.id);
  });
};