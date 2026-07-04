import { useMutation } from "@tanstack/react-query";
import { requestAiStructuredOutput } from "@/services/ai.service";

export type StructuredSpec = {
  category?: string | null;
  maxPrice?: number | null;
  keywords?: string[] | null;
};

const SYSTEM_PROMPT = `You are a shopping assistant that MUST respond only with valid JSON — no markdown, no explanation, no extra text.

Use this exact schema:
{"category": string|null, "maxPrice": number|null, "keywords": string[]|null}

Rules:
- "category" must be a DummyJSON category slug when applicable. Valid slugs include: beauty, fragrances, furniture, groceries, home-decoration, kitchen-accessories, laptops, mens-shirts, mens-shoes, mens-watches, mobile-accessories, motorcycle, skin-care, smartphones, sports-accessories, sunglasses, tablets, tops, vehicle, womens-bags, womens-dresses, womens-jewellery, womens-shoes, womens-watches
- Use null for fields that do not apply
- "keywords" should capture search terms (e.g. ["gaming"], ["dry skin"], ["gift"])
- For price limits, set maxPrice as a number (e.g. 1000 for "under $1000")`;

function extractAiText(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  const choices = data.choices;
  if (Array.isArray(choices) && choices[0]) {
    const choice = choices[0] as Record<string, unknown>;
    const message = choice.message as Record<string, unknown> | undefined;
    if (message?.content && typeof message.content === "string") {
      return message.content;
    }
    if (typeof choice.text === "string") return choice.text;
  }

  if (typeof data.output === "string") return data.output;

  return null;
}

export function useAiRecommendation() {
  return useMutation<StructuredSpec, Error, string>({
    mutationFn: async (userPrompt: string) => {
      const ai = await requestAiStructuredOutput(userPrompt, SYSTEM_PROMPT);
      if (ai.error) throw new Error(ai.error);

      const text = extractAiText(ai.data);
      if (!text) throw new Error("AI did not return a text response.");

      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI did not return parsable JSON.");

      let parsed: StructuredSpec;
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error("Failed to parse AI JSON response.");
      }

      return parsed;
    },
  });
}
