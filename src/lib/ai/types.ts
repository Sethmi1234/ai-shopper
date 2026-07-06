export type AiIntent =
  | "greeting"
  | "gratitude"
  | "product_search"
  | "recommendation"
  | "app_question"
  | "out_of_scope";

export type ApiAction =
  | ""
  | "search_products"
  | "recommended_products"
  | "featured_products";

export type ShoppingAiResponse = {
  intent: AiIntent;
  requiresApiCall: boolean;
  apiAction: ApiAction;
  needsMoreInformation: boolean;
  missingInformation: string[];
  filters: {
    category: string;
    brand: string;
    query: string;
    minPrice: number | null;
    maxPrice: number | null;
    color: string;
    purpose: string;
  };
  reply: string;
  confidenceScore: number;
};

export type ShoppingAiResponseOverrides = Omit<
  Partial<ShoppingAiResponse>,
  "filters"
> & {
  filters?: Partial<ShoppingAiResponse["filters"]>;
};
