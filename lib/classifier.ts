import Anthropic from "@anthropic-ai/sdk";
import {
  buildClassificationPrompt,
  buildVisionClassificationPrompt,
} from "@/lib/prompts";
import { extractTextFromPDF } from "@/lib/extractor";
import type { ClassificationResult } from "@/types";

const anthropic = new Anthropic();
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 128;
const API_TIMEOUT = 6000;

interface RawClassification {
  label: string;
  confidence: number;
  reasoning: string;
}

function parseClaudeResponse(text: string): RawClassification {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.label || typeof parsed.confidence !== "number" || !parsed.reasoning) {
    throw new Error("Missing required fields in classification response");
  }

  parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

  return parsed as RawClassification;
}

async function callClaudeText(
  textContent: string
): Promise<RawClassification> {
  const prompt = buildClassificationPrompt(textContent);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: controller.signal }
    );

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return parseClaudeResponse(text);
  } finally {
    clearTimeout(timeout);
  }
}

async function callClaudeVision(
  images: string[],
  mediaType: "image/png" | "image/jpeg"
): Promise<RawClassification> {
  const prompt = buildVisionClassificationPrompt();

  const imageBlocks: Anthropic.ImageBlockParam[] = images.map((data) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: mediaType,
      data,
    },
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: [...imageBlocks, { type: "text", text: prompt }],
          },
        ],
      },
      { signal: controller.signal }
    );

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return parseClaudeResponse(text);
  } finally {
    clearTimeout(timeout);
  }
}

async function callClaudePdf(
  pdfBase64: string
): Promise<RawClassification> {
  const prompt = buildVisionClassificationPrompt();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      },
      { signal: controller.signal }
    );

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return parseClaudeResponse(text);
  } finally {
    clearTimeout(timeout);
  }
}

async function classifyWithRetry(
  fn: () => Promise<RawClassification>
): Promise<RawClassification> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return await fn();
    }
    throw error;
  }
}

export async function classifyDocument(
  file: Buffer,
  mimeType: string
): Promise<ClassificationResult> {
  const startTime = Date.now();

  let raw: RawClassification;
  let extractionMethod: "text" | "vision";

  if (mimeType === "image/png" || mimeType === "image/jpeg") {
    // Image — send directly to vision
    extractionMethod = "vision";
    const base64 = file.toString("base64");
    raw = await classifyWithRetry(() =>
      callClaudeVision([base64], mimeType as "image/png" | "image/jpeg")
    );
  } else {
    // PDF — try text extraction first
    const extractedText = await extractTextFromPDF(file);

    if (extractedText) {
      // Native PDF with text
      extractionMethod = "text";
      raw = await classifyWithRetry(() => callClaudeText(extractedText));
    } else {
      // Scanned PDF — send the PDF directly to Claude
      extractionMethod = "vision";
      const pdfBase64 = file.toString("base64");
      raw = await classifyWithRetry(() => callClaudePdf(pdfBase64));
    }
  }

  const processingTimeMs = Date.now() - startTime;

  return {
    label: raw.label,
    confidence: raw.confidence,
    reasoning: raw.reasoning,
    extractionMethod,
    processingTimeMs,
  };
}
