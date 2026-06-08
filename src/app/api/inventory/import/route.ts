import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const INVENTORY_EXTRACTION_PROMPT = `Extract the inventory/supply items from this image and return them as a JSON object with this exact structure:
{
  "items": [
    {
      "name": "Item Name",
      "category": "BOH",
      "unit": "case",
      "unitCost": 45.00,
      "parLevel": 3,
      "minStock": 1,
      "reorderQty": 2,
      "packSize": "50 lb case",
      "sku": "ABC123",
      "vendorName": "Vendor name if visible, otherwise null",
      "notes": "Any relevant notes, otherwise null"
    }
  ]
}

Rules:
- Extract ALL items visible in the image — invoices, order sheets, supply lists, etc.
- category must be one of: "FOH" (front of house / customer-facing), "BOH" (back of house / kitchen), or "BOTH"
- unit should be the most natural unit: "case", "each", "lb", "gallon", "bag", etc.
- unitCost should be a number in dollars (per unit). If a case costs $45.00, use 45.00
- If costs are not visible, set unitCost to 0
- parLevel, minStock, reorderQty: set to 0 if not visible
- packSize describes what's in a unit, e.g. "50 lb case", "12 x 32 oz case", "6 ct"
- vendorName: the supplier/vendor if listed on the document
- If the image is a single item label, extract just that one item
- If text is unclear, make your best attempt
- Return ONLY valid JSON, no other text`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const model = (formData.get("model") as string) || "z-ai/glm-4.6v";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPG, PNG, WebP, or HEIC image." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const imageDataUrl = `data:${file.type};base64,${base64}`;

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a precise data extraction assistant for a restaurant inventory system. Extract structured inventory item data from invoices, order sheets, supply lists, product labels, and similar documents. Always respond with valid JSON only — no markdown, no explanation, just the JSON object.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: INVENTORY_EXTRACTION_PROMPT },
            {
              type: "image_url",
              image_url: { url: imageDataUrl, detail: "low" },
            },
          ],
        },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    });

    const raw =
      response.choices[0]?.message?.content?.trim()?.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim() || "{}";

    const extracted = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      data: extracted,
      model: response.model,
      usage: response.usage,
    });
  } catch (err) {
    console.error("Inventory import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process image" },
      { status: 500 }
    );
  }
}