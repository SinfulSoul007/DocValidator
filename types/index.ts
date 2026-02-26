export interface ClassificationResult {
  label: string;
  confidence: number;
  reasoning: string;
  extractionMethod: "text" | "vision";
  processingTimeMs: number;
}

export interface DisputeFeedback {
  originalLabel: string;
  correctedLabel: string;
}

export interface ApiResponse {
  success: boolean;
  result?: ClassificationResult;
  error?: string;
}
