import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const image = body?.image;

  if (!image) {
    return NextResponse.json({ error: "Missing image data." }, { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const prompt = `You are an AI Pokemon card expert. The user uploads a photo of a card taken with a phone. Analyze the card image and return a JSON object with these fields:\n- cardName: the card name\n- setName: the card set or edition\n- side: whether the photo shows the front or the back of the card\n- estimatedValue: approximate market value as a string\n- condition: estimated condition (e.g. mint, near mint, excellent, good, fair, poor)\n- centering: estimate centering quality (e.g. centered, slightly off-center, noticeably off-center)\n- whitening: describe any whitening or edge wear visible along the card borders\n- psaGrade: a best-effort PSA grade estimate based on condition, centering, and whitening\n- cropBounds: the approximate crop area used for the card (x, y, width, height) or a short description if not exact\n- notes: any extra observations about the card, image quality, and value drivers.\nRespond only with valid JSON.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: image },
          ],
        },
      ],
      max_output_tokens: 500,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: json.error?.message ?? "OpenAI error." }, { status: response.status });
  }

  const output = json.output?.[0]?.content ?? [];
  const text = output
    .filter((item: any) => item.type === "output_text")
    .map((item: any) => item.text)
    .join("")
    .trim();

  if (!text) {
    return NextResponse.json({ error: "AI response was empty." }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json({ result: parsed });
  } catch {
    return NextResponse.json({ error: "AI did not return valid JSON.", raw: text }, { status: 500 });
  }
}
