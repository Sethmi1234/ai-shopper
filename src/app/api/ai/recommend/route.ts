import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MODEL = "meta/llama-3.3-70b-instruct";
const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userPrompt, systemPrompt, model } = body;

    // ❗ IMPORTANT: use ONLY server-side key
    const apiKey = process.env.NVIDIA_API_KEY;

    const modelId = model || process.env.NVIDIA_MODEL || DEFAULT_MODEL;
    const baseUrl = process.env.NVIDIA_BUILD_URL || DEFAULT_BASE_URL;

    console.log("API KEY STATUS:", apiKey ? "LOADED" : "MISSING");
    console.log("MODEL:", modelId);

    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA API key not configured on server." },
        { status: 500 }
      );
    }

    const controller = new AbortController();

    // ✅ FIX 504 ISSUE → increase timeout
    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000); // ⬅ 60 seconds (VERY IMPORTANT)

    let resp: Response;

    try {
      console.log("Calling NVIDIA API...");

      resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0,
          max_tokens: 512,
        }),
        signal: controller.signal,
      });

      console.log("NVIDIA Response Status:", resp.status);
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

    if (!resp.ok) {
      const txt = await resp.text();

      console.log("NVIDIA ERROR:", resp.status, txt);

      return NextResponse.json(
        {
          error: `NVIDIA API Error ${resp.status}`,
          details: txt,
        },
        { status: 502 }
      );
    }

    const data = await resp.json();

    return NextResponse.json({ data });
  } catch (err: any) {
    console.log("SERVER ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}