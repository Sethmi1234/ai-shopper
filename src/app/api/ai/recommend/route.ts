import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const DEFAULT_MODEL = "meta/llama-3.3-70b-instruct";
const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";

// Initialize OpenAI client configured for NVIDIA API
function createNvidiaClient(): OpenAI {
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseURL = process.env.NVIDIA_BUILD_URL || DEFAULT_BASE_URL;

  return new OpenAI({
    apiKey: apiKey || "",
    baseURL,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userPrompt, systemPrompt, model } = body;

    const apiKey = process.env.NVIDIA_API_KEY;
    const modelId = model || process.env.NVIDIA_MODEL || DEFAULT_MODEL;

    console.log("API KEY STATUS:", apiKey ? "LOADED" : "MISSING");
    console.log("MODEL:", modelId);

    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA API key not configured on server." },
        { status: 500 }
      );
    }

    const client = createNvidiaClient();

    const controller = new AbortController();

    // 60-second timeout to prevent 504 issues
    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      console.log("Calling NVIDIA API via OpenAI SDK...");

      const response = await client.chat.completions.create(
        {
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0,
          max_tokens: 512,
        },
        {
          signal: controller.signal,
        }
      );

      console.log("NVIDIA Response received successfully");

      return NextResponse.json({ data: response });
    } catch (err: any) {
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "AI request timed out (60s limit reached)" },
          { status: 504 }
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: any) {
    console.log("SERVER ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}