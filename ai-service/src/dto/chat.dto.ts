export interface ConversationTurnDto {
  role: "user" | "assistant";
  content: string;
}

export interface RecommendedProductDto {
  id: string;
  title: string;
  price: number;
  category?: string;
  thumbnail?: string;
  rating?: number;
  brand?: string;
  description?: string;
  reasons?: string[];
}

export interface ChatProcessInputDto {
  userId: string;
  userName?: string;
  message: string;
  sessionId?: string;
  conversationHistory?: ConversationTurnDto[];
  socketMemory?: ConversationTurnDto[];
  onToken: (token: string) => void;
}

export interface ChatProcessResultDto {
  reply: string;
  products: RecommendedProductDto[];
  suggestions: string[];
  sessionId: string;
}
