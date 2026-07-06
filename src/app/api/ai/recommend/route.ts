import { NextRequest, NextResponse } from "next/server";
import { getShoppingAssistantResponse } from "@/services/shoppingAssistant.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const conversation = String(body.conversation || "").trim();

    // Frontend should ONLY send: message and conversation (optional)
    // System prompt is built on the backend - never exposed to frontend
    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    // Backend builds prompt, attaches hidden system prompt, calls NVIDIA NIM
    // Validates JSON response, returns result to frontend
    const data = await getShoppingAssistantResponse({
      message,
      conversation,
      useNvidia: true, // Always use NVIDIA AI for structured output
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("AI route error:", error);

    return NextResponse.json(
      { error: "Unable to process AI request." },
      { status: 500 }
    );
  }
}
