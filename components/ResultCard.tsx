"use client";

import type { ClassificationResult } from "@/types";

interface ResultCardProps {
  result: ClassificationResult;
  onAccept: () => void;
  onDispute: () => void;
}

function confidenceColor(c: number): {
  bar: string;
  text: string;
  bg: string;
} {
  if (c > 0.8) return { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (c >= 0.5) return { bar: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50" };
  return { bar: "bg-red-400", text: "text-red-600", bg: "bg-red-50" };
}

export default function ResultCard({
  result,
  onAccept,
  onDispute,
}: ResultCardProps) {
  const colors = confidenceColor(result.confidence);
  const pct = Math.round(result.confidence * 100);
  const timeSec = (result.processingTimeMs / 1000).toFixed(1);

  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-white overflow-hidden">
      {/* Header strip */}
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
            Classification Result
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
              result.extractionMethod === "text"
                ? "bg-blue-50 text-blue-600"
                : "bg-violet-50 text-violet-600"
            }`}
          >
            {result.extractionMethod === "text" ? "Text" : "Vision"}
          </span>
          <span className="text-[11px] tabular-nums text-neutral-400">
            {timeSec}s
          </span>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Document type label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-neutral-900 text-sm font-bold text-white">
            {result.label.charAt(0).toUpperCase()}
          </span>
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
            {result.label}
          </h3>
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
              Confidence
            </span>
            <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <div className={`rounded-md ${colors.bg} px-3.5 py-3 mb-5`}>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {result.reasoning}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Looks correct
          </button>
          <button
            onClick={onDispute}
            className="flex-1 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:border-neutral-300"
          >
            Not right
          </button>
        </div>
      </div>
    </div>
  );
}
