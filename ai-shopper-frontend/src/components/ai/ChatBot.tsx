"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import type { Socket } from "socket.io-client";
import {
  BotMessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  Heart,
  ShoppingCart,
  ChevronRight,
  RefreshCw,
  Star,
  Clock,
  Trash2,
  MessageCircle,
  History,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import useWishlist from "../../store/useWishlist";
import useCart from "../../store/useCart";
import { getConnectedSocket, getSocket } from "../../lib/socket";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
  category?: string;
  thumbnail?: string;
  rating?: number;
  brand?: string;
  description?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  isFollowUp?: boolean;
  isLoading?: boolean;
};

type HistoryConversation = {
  id: string;
  sessionId: string;
  title: string;
  messageCount: number;
  preview: string;
  createdAt: string;
  updatedAt: string;
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const WELCOME: Message = {
  role: "assistant",
  text: "👋 Hi! I'm your AI shopping assistant.\n\nI can help you find the perfect products. Just tell me what you're looking for and I'll ask a few quick questions to get the best results for you!\n\nTry: \"I want a laptop\", \"Show me skincare for dry skin\", or \"I'm looking for food\"",
};

const QUICK_PROMPTS = [
  "Show me laptops",
  "Skincare for dry skin",
  "Gifts for tech lovers",
  "Food to eat now",
];

const CHAT_STORAGE_KEY = "ai-shopper-chatbot-state-v1";
const CHAT_SYNC_EVENT = "ai-shopper-chatbot-sync";

type StoredChatState = {
  isOpen: boolean;
  messages: Message[];
  conversationHistory: ConversationTurn[];
  updatedAt: number;
  sourceId: string;
};

const readStoredAccessToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  return token && token !== "undefined" && token !== "null" ? token : null;
};

const normalizeMessages = (value: unknown): Message[] => {
  if (!Array.isArray(value)) return [WELCOME];
  const messages = value
    .filter((message) => {
      if (!message || typeof message !== "object") return false;
      const candidate = message as Partial<Message>;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.text === "string"
      );
    })
    .map((message) => {
      const candidate = message as Message;
      return {
        role: candidate.role,
        text: candidate.text,
        products: Array.isArray(candidate.products)
          ? candidate.products.slice(0, 6).map((product) => ({
              ...product,
              id: String(product.id),
            }))
          : undefined,
        isFollowUp: Boolean(candidate.isFollowUp),
        isLoading: Boolean(candidate.isLoading),
      };
    })
    .slice(-50);
  return messages.length > 0 ? messages : [WELCOME];
};

const normalizeConversation = (value: unknown): ConversationTurn[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((turn) => {
      if (!turn || typeof turn !== "object") return false;
      const candidate = turn as Partial<ConversationTurn>;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string"
      );
    })
    .map((turn) => ({
      role: (turn as ConversationTurn).role,
      content: (turn as ConversationTurn).content,
    }))
    .slice(-20);
};

const readStoredChatState = (): StoredChatState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      isOpen: Boolean(parsed.isOpen),
      messages: normalizeMessages(parsed.messages),
      conversationHistory: normalizeConversation(parsed.conversationHistory),
      updatedAt: Number(parsed.updatedAt) || 0,
      sourceId: typeof parsed.sourceId === "string" ? parsed.sourceId : "",
    };
  } catch {
    return null;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"thinking" | "searching" | "filtering">("thinking");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryConversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryMessages, setSelectedHistoryMessages] = useState<HistoryMessage[] | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef("");
  const sourceIdRef = useRef(
    `chatbot-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const hasLoadedStoredChatRef = useRef(false);
  const suppressNextPersistRef = useRef(false);
  const latestSyncedAtRef = useRef(0);
  const attachedSocketRef = useRef<Socket | null>(null);
  const socketHandlersRef = useRef<{
    start: () => void;
    chunk: (payload: { text: string }) => void;
    done: (payload?: { reply?: string; products?: Product[]; sessionId?: string }) => void;
    error: (payload?: { message?: string }) => void;
    connectError: () => void;
    historyLoaded: (payload: { sessionId: string; messages: HistoryMessage[] }) => void;
  } | null>(null);

  // Zustand stores
  const { toggleItem: wishlistToggle, isWishlisted } = useWishlist();
  const { addItem: cartAddItem } = useCart();

  const handleWishlistToggle = (product: { id: string; title: string; price: number; thumbnail?: string; category?: string; rating?: number }) => {
    wishlistToggle({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      thumbnail: product.thumbnail,
      category: product.category,
      rating: Number(product.rating),
    });
  };

  const handleAddToCart = (product: { id: string; title: string; price: number; thumbnail?: string; category?: string }) => {
    cartAddItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      thumbnail: product.thumbnail,
      category: product.category,
    }, 1);
  };

  const applySyncedState = useCallback((state: StoredChatState) => {
    if (state.sourceId === sourceIdRef.current || state.updatedAt < latestSyncedAtRef.current) return;
    latestSyncedAtRef.current = state.updatedAt;
    suppressNextPersistRef.current = true;
    setIsOpen(state.isOpen);
    setMessages(normalizeMessages(state.messages));
    setConversationHistory(normalizeConversation(state.conversationHistory));
  }, []);

  useEffect(() => {
    const stored = readStoredChatState();
    if (stored) {
      latestSyncedAtRef.current = stored.updatedAt;
      setIsOpen(stored.isOpen);
      setMessages(stored.messages);
      setConversationHistory(stored.conversationHistory);
    }
    hasLoadedStoredChatRef.current = true;

    if ("BroadcastChannel" in window) {
      broadcastRef.current = new BroadcastChannel(CHAT_SYNC_EVENT);
      broadcastRef.current.onmessage = (event) => {
        if (event.data?.type === CHAT_SYNC_EVENT && event.data.state) {
          applySyncedState(event.data.state);
        }
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CHAT_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        applySyncedState({
          isOpen: Boolean(parsed.isOpen),
          messages: normalizeMessages(parsed.messages),
          conversationHistory: normalizeConversation(parsed.conversationHistory),
          updatedAt: Number(parsed.updatedAt) || Date.now(),
          sourceId: typeof parsed.sourceId === "string" ? parsed.sourceId : "",
        });
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      broadcastRef.current?.close();
      broadcastRef.current = null;
    };
  }, [applySyncedState]);

  useEffect(() => {
    if (!hasLoadedStoredChatRef.current) return;
    if (suppressNextPersistRef.current) {
      suppressNextPersistRef.current = false;
      return;
    }
    const state: StoredChatState = {
      isOpen,
      messages: normalizeMessages(messages),
      conversationHistory: normalizeConversation(conversationHistory),
      updatedAt: Date.now(),
      sourceId: sourceIdRef.current,
    };
    latestSyncedAtRef.current = state.updatedAt;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
    broadcastRef.current?.postMessage({ type: CHAT_SYNC_EVENT, state });
  }, [conversationHistory, isOpen, messages]);

  const attachAiSocketListeners = useCallback((socket: Socket) => {
    if (attachedSocketRef.current === socket) return;

    if (attachedSocketRef.current && socketHandlersRef.current) {
      const previous = attachedSocketRef.current;
      previous.off("ai:start", socketHandlersRef.current.start);
      previous.off("ai:chunk", socketHandlersRef.current.chunk);
      previous.off("ai:done", socketHandlersRef.current.done);
      previous.off("ai:error", socketHandlersRef.current.error);
      previous.off("connect_error", socketHandlersRef.current.connectError);
      previous.off("ai:historyLoaded", socketHandlersRef.current.historyLoaded);
    }

    const updateStreamingMessage = (updates: Partial<Message>) => {
      setMessages((prev) => {
        const next = [...prev];
        const index = next.length - 1;
        if (index < 0 || next[index].role !== "assistant") {
          return [...next, { role: "assistant", text: "", ...updates }];
        }
        next[index] = { ...next[index], ...updates };
        return next;
      });
    };

    const handleStart = () => {
      streamingTextRef.current = "";
      setIsLoading(true);
      setLoadingStage("thinking");
      setMessages((prev) => [...prev, { role: "assistant", text: "", isLoading: true }]);
    };

    const handleChunk = ({ text }: { text: string }) => {
      streamingTextRef.current += text;
      updateStreamingMessage({ text: streamingTextRef.current, isLoading: false });
    };

    const handleDone = ({ reply, products, sessionId }: { reply?: string; products?: Product[]; sessionId?: string } = {}) => {
      const finalReply = (streamingTextRef.current || reply || "").trim();
      const safeReply = finalReply || "How can I help you find the right product today?";
      const safeProducts = Array.isArray(products)
        ? products.map((product) => ({ ...product, id: String(product.id) }))
        : [];

      if (sessionId) setCurrentSessionId(sessionId);

      updateStreamingMessage({
        text: safeReply,
        products: safeProducts.length > 0 && finalReply.length > 0 ? safeProducts.slice(0, 6) : undefined,
        isLoading: false,
      });

      setConversationHistory((prev) => [...prev, { role: "assistant", content: safeReply }]);
      setIsLoading(false);
      setLoadingStage("thinking");
      streamingTextRef.current = "";
    };

    const handleError = ({ message }: { message?: string } = {}) => {
      const errorText = message || "Something went wrong with the AI response.";
      setMessages((prev) => {
        const next = [...prev];
        const index = next.length - 1;
        if (index >= 0 && next[index].role === "assistant" && next[index].isLoading) {
          next[index] = { role: "assistant", text: errorText, isLoading: false };
          return next;
        }
        return [...next, { role: "assistant", text: errorText }];
      });
      setIsLoading(false);
      setLoadingStage("thinking");
      streamingTextRef.current = "";
    };

    const handleConnectError = () => {
      handleError({ message: "Please log in again to use the AI assistant." });
    };

    const handleHistoryLoaded = (payload: { sessionId: string; messages: HistoryMessage[] }) => {
      setSelectedHistoryMessages(payload.messages);
    };

    const handlers = {
      start: handleStart,
      chunk: handleChunk,
      done: handleDone,
      error: handleError,
      connectError: handleConnectError,
      historyLoaded: handleHistoryLoaded,
    };

    socket.on("ai:start", handlers.start);
    socket.on("ai:chunk", handlers.chunk);
    socket.on("ai:done", handlers.done);
    socket.on("ai:error", handlers.error);
    socket.on("connect_error", handlers.connectError);
    socket.on("ai:historyLoaded", handlers.historyLoaded);

    attachedSocketRef.current = socket;
    socketHandlersRef.current = handlers;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAccessToken(readStoredAccessToken());
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncToken = () => setAccessToken(readStoredAccessToken());
    syncToken();
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    attachAiSocketListeners(socket);
  }, [accessToken, attachAiSocketListeners]);

  useEffect(() => (
    () => {
      if (attachedSocketRef.current && socketHandlersRef.current) {
        attachedSocketRef.current.off("ai:start", socketHandlersRef.current.start);
        attachedSocketRef.current.off("ai:chunk", socketHandlersRef.current.chunk);
        attachedSocketRef.current.off("ai:done", socketHandlersRef.current.done);
        attachedSocketRef.current.off("ai:error", socketHandlersRef.current.error);
        attachedSocketRef.current.off("connect_error", socketHandlersRef.current.connectError);
        attachedSocketRef.current.off("ai:historyLoaded", socketHandlersRef.current.historyLoaded);
      }
    }
  ), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const resetChat = () => {
    setMessages([WELCOME]);
    setConversationHistory([]);
    setInput("");
    setIsLoading(false);
    streamingTextRef.current = "";
    setCurrentSessionId(undefined);
    if (attachedSocketRef.current) {
      attachedSocketRef.current.emit("ai:newConversation");
    }
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    const updatedHistory: ConversationTurn[] = [
      ...conversationHistory,
      { role: "user", content: text },
    ];
    setConversationHistory(updatedHistory);

    try {
      const connection = await getConnectedSocket(accessToken);
      attachAiSocketListeners(connection.socket);
      if (connection.accessToken !== accessToken) {
        setAccessToken(connection.accessToken);
      }
      const socket = connection.socket;
      socket.emit("ai:message", {
        message: text,
        conversationHistory: updatedHistory,
        sessionId: currentSessionId,
      });
    } catch (err: any) {
      console.error("ChatBot error:", err);
      const status = err?.status ?? err?.response?.status;
      let errorText = "Sorry, I'm having trouble connecting. Please make sure the backend server is running and try again.";
      if (status === 429) errorText = "You're sending messages too fast! Please wait a moment before trying again. ⏳";
      else if (status === 401) errorText = "Please log in to use the AI assistant.";
      else if (status >= 500) errorText = "The AI service is temporarily unavailable. Please try again in a moment.";
      setMessages((prev) => [...prev, { role: "assistant", text: errorText }]);
      setIsLoading(false);
      setLoadingStage("thinking");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Chat History via Socket ──────────────────────────────────────────────
  const loadHistoryList = async () => {
    setHistoryLoading(true);
    setShowHistory(true);
    setSelectedHistoryMessages(null);
    try {
      const connection = await getConnectedSocket(accessToken);
      const socket = connection.socket;
      // Listen for history list response
      const handleHistoryList = (payload: { conversations: HistoryConversation[] }) => {
        setHistoryList(payload.conversations || []);
        setHistoryLoading(false);
        socket.off("ai:historyList", handleHistoryList);
      };
      socket.on("ai:historyList", handleHistoryList);
      socket.emit("ai:getHistoryList");
      // Timeout fallback
      setTimeout(() => {
        socket.off("ai:historyList", handleHistoryList);
        setHistoryLoading(false);
      }, 5000);
    } catch {
      setHistoryLoading(false);
    }
  };

  const loadHistoryConversation = (sessionId: string) => {
    setSelectedHistoryMessages([]);
    if (attachedSocketRef.current) {
      attachedSocketRef.current.emit("ai:loadHistory", { sessionId });
    }
  };

  const continueHistoryConversation = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
    setSelectedHistoryMessages(null);
    if (attachedSocketRef.current) {
      attachedSocketRef.current.emit("ai:loadHistory", { sessionId });
    }
  };

  const deleteHistoryConversation = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const connection = await getConnectedSocket(accessToken);
      const socket = connection.socket;
      socket.emit("ai:deleteHistory", { sessionId });
      setHistoryList((prev) => prev.filter((c) => c.sessionId !== sessionId));
    } catch {}
  };

  const loadingLabel = loadingStage === "thinking" ? "AI is thinking..." : loadingStage === "searching" ? "Searching products..." : "AI is filtering results...";
  const lastMessage = messages[messages.length - 1];
  const hasPendingAssistant = lastMessage?.role === "assistant" && Boolean(lastMessage.isLoading);

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Floating Button */}
      <div className="fixed right-8 bottom-8 z-50">
        {isOpen ? (
          <button
            onClick={() => setIsOpen(false)}
            className="bg-black text-[#ccff00] p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-900 transition-all flex items-center justify-center"
          >
            <X size={26} />
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black text-[#ccff00] p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-900 transition-all flex items-center justify-center relative border border-[#ccff00]/20"
          >
            <BotMessageSquare size={26} />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#ccff00] rounded-full border-2 border-black animate-pulse" />
          </button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-8 bottom-24 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up"
          style={{ height: "560px" }}
        >
          {/* Header */}
          <div className="bg-black text-white px-5 py-3.5 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#ccff00]/20 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-[#ccff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">AI Shopping Assistant</p>
              <p className="text-[11px] text-[#ccff00]/70">
                {isLoading ? loadingLabel : "Online • Ask me anything!"}
              </p>
            </div>
            <button
              onClick={() => { loadHistoryList(); }}
              title="Chat history"
              className="text-gray-400 hover:text-[#ccff00] transition-colors p-1"
            >
              <History size={15} />
            </button>
            <button
              onClick={resetChat}
              title="Clear chat"
              className="text-gray-400 hover:text-[#ccff00] transition-colors p-1"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Body: Chat Messages or History */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto bg-gray-50/40">
              {/* History Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
                <button
                  onClick={() => {
                    if (selectedHistoryMessages) {
                      setSelectedHistoryMessages(null);
                    } else {
                      setShowHistory(false);
                    }
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                >
                  ← Back
                </button>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {selectedHistoryMessages ? "Conversation" : "Chat History"}
                </span>
                <div className="w-10" />
              </div>

              {/* Selected conversation messages */}
              {selectedHistoryMessages ? (
                <div className="p-4 space-y-3">
                  {selectedHistoryMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading messages...</div>
                  ) : (
                    selectedHistoryMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          msg.role === "user" ? "bg-black text-[#ccff00]" : "bg-gray-200 text-gray-600"
                        }`}>
                          {msg.role === "user" ? <User size={11} /> : <Sparkles size={11} />}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user" ? "bg-black text-white rounded-tr-sm" : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {/* Continue button */}
                  <button
                    onClick={() => {
                      const sessionId = historyList.find(h => h.id === selectedHistoryMessages[0]?.role)?.sessionId;
                      if (sessionId) continueHistoryConversation(sessionId);
                    }}
                    className="w-full mt-2 py-2 bg-black text-[#ccff00] text-xs font-bold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Continue this conversation
                  </button>
                </div>
              ) : historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="animate-spin text-black" size={20} />
                  <p className="text-xs text-gray-400">Loading history...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-1">No conversations yet</p>
                  <p className="text-xs text-gray-400">Start chatting to see your history here.</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {historyList.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => loadHistoryConversation(conv.sessionId)}
                      className="w-full text-left bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all rounded-lg p-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                          <MessageCircle size={14} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{conv.title}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{conv.preview || "No messages"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-300 flex items-center gap-0.5">
                              <MessageCircle size={8} /> {conv.messageCount}
                            </span>
                            <span className="text-[9px] text-gray-300 flex items-center gap-0.5">
                              <Clock size={8} /> {formatDate(conv.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryConversation(conv.sessionId, e)}
                          className="p-1.5 rounded text-gray-200 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSend(p)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 hover:border-black hover:text-black transition-colors font-medium"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user" ? "bg-black text-[#ccff00]" : "bg-gray-200 text-gray-700"
                    }`}>
                      {msg.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                    </div>
                    <div className="max-w-[88%] flex flex-col gap-2">
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user" ? "bg-black text-white rounded-tr-sm" : msg.isFollowUp ? "bg-[#ccff00]/10 border border-[#ccff00]/40 text-gray-800 rounded-tl-sm" : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"
                      }`}>
                        {msg.isLoading && !msg.text ? loadingLabel : msg.text}
                        {msg.isFollowUp && (
                          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">↳ AI needs more info</p>
                        )}
                      </div>

                      {msg.products && msg.products.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                            AI-filtered results ({msg.products.length})
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {msg.products.map((product) => {
                              const wishlisted = isWishlisted(product.id);
                              return (
                                <div key={product.id} className="relative bg-white border border-gray-100 group cursor-pointer">
                                  <Link href={`/dashboard/products/${product.id}`} className="block">
                                    <div className="relative h-[140px] w-full bg-gray-50 mb-2 overflow-hidden">
                                      {product.thumbnail ? (
                                        <Image src={product.thumbnail} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                      )}
                                      <div className="absolute top-1.5 right-1.5 z-10">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlistToggle({ id: product.id, title: product.title, price: Number(product.price), thumbnail: product.thumbnail, category: product.category, rating: Number(product.rating) }); }} className="bg-white p-1.5 text-black hover:bg-[#ccff00] transition-colors shadow-sm">
                                          <Heart size={12} strokeWidth={2} className={wishlisted ? "fill-black" : ""} />
                                        </button>
                                      </div>
                                      <div className="absolute bottom-0 left-0 w-full p-2 flex gap-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/60 to-transparent">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart({ id: product.id, title: product.title, price: Number(product.price), thumbnail: product.thumbnail, category: product.category }); }} className="flex-1 bg-white hover:bg-black hover:text-white text-black py-2 text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5">
                                          <ShoppingCart size={10} /> Add
                                        </button>
                                      </div>
                                    </div>
                                    <div className="px-1.5 pb-2">
                                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5 truncate">{product.category || "General"}</p>
                                      <p className="text-[11px] font-bold text-gray-900 line-clamp-1 leading-snug">{product.title}</p>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-black text-black">${Number(product.price).toFixed(2)}</span>
                                        {product.rating && (
                                          <div className="flex items-center gap-0.5">
                                            <Star size={8} className="text-black fill-black" />
                                            <span className="text-[9px] font-bold text-black">{Number(product.rating).toFixed(1)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                          <Link href="/dashboard/products" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors px-1 pt-1">
                            Browse all products <ChevronRight size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && !hasPendingAssistant && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                      <Sparkles size={13} />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                      <Loader2 className="animate-spin text-black shrink-0" size={15} />
                      <span className="text-xs text-gray-500 font-medium">{loadingLabel}</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-3 bg-white shrink-0">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about products..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 bg-black text-[#ccff00] flex items-center justify-center hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-300 mt-1.5 font-medium">
                  Powered by Mistral AI · NVIDIA NIM
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </>
  );
}