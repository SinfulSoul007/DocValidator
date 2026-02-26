import { NextRequest, NextResponse } from "next/server";
import { classifyDocument } from "@/lib/classifier";
import type { ApiResponse } from "@/types";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Accepted: PDF, PNG, JPG`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large. Maximum size is 4.5MB",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await classifyDocument(buffer, file.type);

    console.log(
      `[classify] label="${result.label}" confidence=${result.confidence} method=${result.extractionMethod} time=${result.processingTimeMs}ms type=${file.type} size=${file.size}`
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Classification error:", error);

    const message =
      error instanceof Error ? error.message : "Classification failed";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
