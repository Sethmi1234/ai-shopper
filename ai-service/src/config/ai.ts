import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";

// Load environment variables explicitly at module level
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if NVIDIA API key is available
const apiKey = process.env.NVIDIA_API_KEY;

if (!apiKey) {
  console.warn("⚠️  NVIDIA_API_KEY is not set in environment variables. AI features will be disabled.");
} else {
  console.log("✅ NVIDIA_API_KEY loaded successfully");
}

const aiClient = new OpenAI({
  apiKey: apiKey || "dummy-key", // Provide a dummy key to prevent crash
  baseURL: process.env.NVIDIA_BUILD_URL || "https://integrate.api.nvidia.com/v1",
});

export default aiClient;
