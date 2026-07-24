import { Socket } from "socket.io";
import { ConversationTurn } from "../../services/ai.service";
import { streamShoppingAssistantResponse, clearSocketMemory } from "../../services/chatService";
import { rateLimitCheck } from "../../services/aiRateLimit.service";

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

      socket.emit("ai:done", {
        reply: result.reply,
        products: result.products,
        suggestions: result.suggestions ?? [],
        sessionId: result.sessionId,
      });
    } catch (error) {
      console.error("AI socket stream error:", error);
      socket.emit("ai:error", {
        message:
          "I'm having trouble connecting to the AI service. Please try again in a few moments.",
      });
    }
  });

  socket.on("disconnect", () => {
    clearSocketMemory(socket.id);
  });
};
