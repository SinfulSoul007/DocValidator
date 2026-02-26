export function buildClassificationPrompt(content: string): string {
  return `You are a document classifier. Analyze the document content below. Identify the document type based on keywords, structure, and context.

## Rules:
- Determine the most specific document type you can (e.g. "Electric Bill", "W-2 Tax Form", "Auto Insurance Policy", "Bank Statement")
- Provide a short label (2-4 words)
- Confidence should reflect how certain you are (0.0 = uncertain, 1.0 = certain)
- Keep reasoning to 1 sentence

## Document Content:
${content}

Respond with ONLY valid JSON, no markdown fences:
{"label": "Document Type", "confidence": 0.95, "reasoning": "Brief explanation"}`;
}

export function buildVisionClassificationPrompt(): string {
  return `You are a document classifier. Look at the document image(s) and identify the document type based on visual layout, logos, text, and structure.

## Rules:
- Determine the most specific document type you can (e.g. "Electric Bill", "W-2 Tax Form", "Auto Insurance Policy", "Bank Statement")
- Provide a short label (2-4 words)
- Confidence should reflect how certain you are (0.0 = uncertain, 1.0 = certain)
- Keep reasoning to 1 sentence

Respond with ONLY valid JSON, no markdown fences:
{"label": "Document Type", "confidence": 0.95, "reasoning": "Brief explanation"}`;
}
