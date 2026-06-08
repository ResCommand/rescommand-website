import { NextRequest, NextResponse } from "next/server";
import { extractFromImage, parseLLMResponse } from "@/lib/llm";

export const maxDuration = 30; // Allow up to 30s for LLM processing

const RECIPE_EXTRACTION_PROMPT = `Extract the recipe from this image and return it as a JSON object with this exact structure:
{
  "name": "Recipe Title",
  "category": "general",
  "description": "Brief description if visible, otherwise null",
  "yield": "e.g. Makes 24 sandwiches, or null if not stated",
  "ingredients": [
    { "name": "Ingredient name", "amount": "2", "unit": "cups" }
  ],
  "instructions": "Full instructions as a single string with numbered steps, or null if not visible"
}

Rules:
- Extract ALL ingredients visible, even if amounts are approximate
- If an amount is a range like "2-3", use "2-3" as the amount string
- Standardize units: cups, tbsp, tsp, lb, oz, each, etc.
- For oven temperatures, include them in instructions (not as separate fields)
- For batch/production recipes, capture the yield info
- category should be one of: base, filling, topping, general, sandwiches, glazes, icings, drinks, other
- If the image contains multiple recipes, extract the PRIMARY one
- If text is unclear or partially cut off, make your best attempt and mark uncertain values
- Return ONLY valid JSON, no other text`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const model = (formData.get("model") as string) || "z-ai/glm-4.6v";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPG, PNG, WebP, or HEIC image." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use GPT-4o if specifically requested (for handwritten/complex recipes)
    const prompt = RECIPE_EXTRACTION_PROMPT;

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const base64 = buffer.toString("base64");
    const imageDataUrl = `data:${file.type};base64,${base64}`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a precise data extraction assistant for a restaurant operations system. Extract structured data from recipe cards, production sheets, and similar food service documents. Always respond with valid JSON only — no markdown, no explanation, just the JSON object.",
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

    const raw =
      response.choices[0]?.message?.content?.trim()?.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim() || "{}";

    const extracted = parseLLMResponse<{
      name: string;
      category: string;
      description?: string | null;
      yield?: string | null;
      ingredients: { name: string; amount: string; unit: string }[];
      instructions?: string | null;
    }>(raw);

    return NextResponse.json({
      success: true,
      data: extracted,
      model: response.model,
      usage: response.usage,
    });
  } catch (err) {
    console.error("Recipe import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process image" },
      { status: 500 }
    );
  }
}