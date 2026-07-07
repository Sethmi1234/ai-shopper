import OpenAI from "openai";

/**
 * Generic NVIDIA NIM AI caller
 * - Always returns parsed JSON
 * - Keeps prompt logic outside this function
 */
export const callNvidiaAI = async (params: {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<any> => {
  const client = new OpenAI({
    baseURL:
      process.env.NVIDIA_BUILD_URL || "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY!,
    maxRetries: 0,
  });

  try {
    const completion = await client.chat.completions.create({
      model: params.model,
      messages: [
        {
          role: "user",
          content: params.prompt,
        },
      ],
      temperature: params.temperature ?? 0.5,
      max_tokens: params.maxTokens ?? 1024,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    // Try to extract JSON from the response (handles markdown code blocks or plain JSON)
    const jsonMatch = content.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const firstBrace = jsonMatch.indexOf("{");
    const lastBrace = jsonMatch.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = jsonMatch.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    }
    
    // Fallback: try parsing the entire response as JSON
    return JSON.parse(content);
  } catch (error) {
    console.error("NVIDIA AI Error:", error);

    return {
      success: false,
      error: "AI request failed",
      data: null,
    };
  }
};