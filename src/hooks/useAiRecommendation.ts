import { useMutation } from "@tanstack/react-query";
import { requestAiStructuredOutput } from "@/services/ai.service";

export type StructuredSpec = {
  category?: string | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  brand?: string | null;
  query?: string | null;
  color?: string | null;
  purpose?: string | null;
  keywords?: string[] | null;
};

export function useAiRecommendation() {
  return useMutation<StructuredSpec, Error, string>({
    mutationFn: async (userPrompt: string) => {
      const ai = await requestAiStructuredOutput(userPrompt);
      if (ai.error) throw new Error(ai.error);
      if (!ai.data) throw new Error("AI did not return a structured response.");

      return {
        ...ai.data.filters,
        keywords: [
          ai.data.filters.brand,
          ai.data.filters.query,
          ai.data.filters.color,
          ai.data.filters.purpose,
        ].filter(Boolean),
      };
    },
  });
}
