import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return errorResponse("Cross-origin requests are not accepted.", "INVALID_ORIGIN", 403);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_SIZE + 128 * 1024) {
    return errorResponse("The image must be smaller than 4 MB.", "IMAGE_TOO_LARGE", 413);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorResponse("Image analysis is not configured on this server.", "NOT_CONFIGURED", 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("The request must contain an image file.", "INVALID_REQUEST", 400);
  }

  const image = form.get("image");
  if (!(image instanceof File)) {
    return errorResponse("Choose an image before starting the analysis.", "INVALID_IMAGE", 400);
  }
  if (!SUPPORTED_TYPES.has(image.type)) {
    return errorResponse("Use a JPEG, PNG, or WebP image.", "INVALID_IMAGE", 400);
  }
  if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
    return errorResponse("The image must be smaller than 4 MB.", "IMAGE_TOO_LARGE", 413);
  }
  const requestedLanguage = form.get("language");
  if (requestedLanguage !== null && requestedLanguage !== "ar" && requestedLanguage !== "en") {
    return errorResponse("Choose a supported response language.", "INVALID_LANGUAGE", 400);
  }
  const requestedTask = form.get("task");
  if (requestedTask !== null && requestedTask !== "describe" && requestedTask !== "obstacles") {
    return errorResponse("Choose a supported image-analysis task.", "INVALID_TASK", 400);
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const base64 = bytes.toString("base64");
  const model = process.env.AI_VISION_MODEL || "gpt-4o-mini";
  const languageInstruction = requestedLanguage === "en" ? "English" : "Arabic";
  const taskInstruction = requestedTask === "obstacles"
    ? "Look only for obstacles that are visibly apparent in this single image. Describe a possible visible obstacle and its approximate location in the image. If none is clear, say so. Do not infer that the path is safe."
    : "Briefly describe the visible scene and a few useful, recognizable objects.";
  const prompt =
    `Respond in ${languageInstruction} in clear language suitable for a blind or low-vision user. ${taskInstruction} ` +
    "Mention only visual details supported by the image. This is a single-frame assistive observation, not a safety system: " +
    "never claim to detect every hazard, guarantee safety, give turn-by-turn navigation, or give urgent safety instructions. " +
    "State uncertainty when details are unclear. Keep the response to a few concise sentences.";

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.type};base64,${base64}`,
                  detail: "low",
                },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Vision provider request failed:", error instanceof Error ? error.message : "Unknown network error");
    return errorResponse("The image analysis service could not be reached. Please try again.", "PROVIDER_UNAVAILABLE", 502);
  }

  if (!upstream.ok) {
    console.error("Vision provider returned HTTP status:", upstream.status);
    if (upstream.status === 401 || upstream.status === 403) {
      return errorResponse("The image analysis service is not configured correctly.", "PROVIDER_CONFIGURATION", 502);
    }
    if (upstream.status === 429) {
      return errorResponse("The image analysis service is busy. Please try again shortly.", "PROVIDER_BUSY", 503);
    }
    return errorResponse("The image analysis service could not complete this request.", "PROVIDER_ERROR", 502);
  }

  let payload: {
    choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  };
  try {
    payload = await upstream.json();
  } catch {
    console.error("Vision provider returned invalid JSON.");
    return errorResponse("The image analysis service returned an invalid response.", "INVALID_PROVIDER_RESPONSE", 502);
  }

  const content = payload.choices?.[0]?.message?.content;
  const description = typeof content === "string"
    ? content.trim()
    : Array.isArray(content)
      ? content.map((item) => item.text || "").join("\n").trim()
      : "";

  if (!description) {
    console.error("Vision provider response did not include a description.");
    return errorResponse("The image analysis service returned no description.", "EMPTY_PROVIDER_RESPONSE", 502);
  }

  return NextResponse.json({ description });
}
