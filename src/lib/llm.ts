import OpenAI from "openai";

// Shared LLM client — uses the Drytis gateway
export function getLLMClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });
}

// Resize image to reduce token cost (max 800px on longest side)
export async function resizeImage(buffer: Buffer, mimeType: string): Promise<string> {
  // For now, send as-is if under 1MB, otherwise just send it
  // Browser-side resizing handles the heavy lifting before upload
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

// Call LLM with an image and extraction prompt
export async function extractFromImage(
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<string> {
  const client = getLLMClient();
  const imageDataUrl = await resizeImage(imageBuffer, mimeType);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a precise data extraction assistant for a restaurant operations system. Extract structured data from recipe cards, inventory lists, invoices, and similar food service documents. Always respond with valid JSON only — no markdown, no explanation, just the JSON object.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: imageDataUrl, detail: "low" },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content?.trim() || "{}";
  // Strip markdown code fences if present
  return content.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
}

// Parse LLM JSON response safely
export function parseLLMResponse<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${raw.substring(0, 200)}`);
  }
}