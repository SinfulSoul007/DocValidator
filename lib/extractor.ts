import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Disable worker for serverless — v3 supports this
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

const TEXT_MIN_LENGTH = 50;
const TEXT_MAX_LENGTH = 3000;

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<string | null> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const maxPages = Math.min(doc.numPages, 2);
    let fullText = "";

    for (let i = 1; i <= maxPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter(
          (item: Record<string, unknown>) =>
            "str" in item && typeof item.str === "string"
        )
        .map((item: Record<string, unknown>) => item.str as string)
        .join(" ");
      fullText += pageText + "\n";

      if (fullText.length >= TEXT_MAX_LENGTH) break;
    }

    const text = fullText.trim();
    if (!text || text.length < TEXT_MIN_LENGTH) {
      return null;
    }
    return text.slice(0, TEXT_MAX_LENGTH);
  } catch {
    return null;
  }
}
