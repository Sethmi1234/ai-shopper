export type AiResponse = {
  data?: any;
  error?: string;
};

export async function requestAiStructuredOutput(
  userPrompt: string,
  systemPrompt = "Follow instructions and return ONLY valid JSON matching the schema.",
  model?: string
): Promise<AiResponse> {
  try {
    const res = await fetch(`/api/ai/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt, systemPrompt, model }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { error: `Server error: ${res.status} ${txt}` };
    }

    const json = await res.json();
    return json as AiResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}