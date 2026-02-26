"use client";

import { useState } from "react";
import DropZone from "@/components/DropZone";
import ResultCard from "@/components/ResultCard";
import DisputeForm from "@/components/DisputeForm";
import type { ClassificationResult } from "@/types";

type AppState = "idle" | "processing" | "result" | "disputing" | "accepted";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResult = (res: ClassificationResult) => {
    setResult(res);
    setError(null);
    setState("result");
  };

  const handleError = (msg: string) => {
    setError(msg);
    setResult(null);
    setState("idle");
  };

  const handleAccept = () => {
    setState("accepted");
  };

  const handleDispute = () => {
    setState("disputing");
  };

  const handleDisputeClose = () => {
    setState("idle");
    setResult(null);
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 sm:py-24">
      {/* Header */}
      <div className="w-full max-w-md text-center mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          DocValidator
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Upload a document for instant classification.
          <br />
          PDF, PNG, or JPG — results in under 5 seconds.
        </p>
      </div>

      {/* Content */}
      <div className="w-full max-w-md space-y-4">
        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Drop zone — always visible unless disputing or accepted */}
        {state !== "disputing" && state !== "accepted" && (
          <DropZone
            onResult={handleResult}
            onError={handleError}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}

        {/* Result card */}
        {state === "result" && result && (
          <ResultCard
            result={result}
            onAccept={handleAccept}
            onDispute={handleDispute}
          />
        )}

        {/* Dispute form */}
        {state === "disputing" && result && (
          <DisputeForm
            originalLabel={result.label}
            onClose={handleDisputeClose}
          />
        )}

        {/* Accepted confirmation */}
        {state === "accepted" && result && (
          <div className="w-full rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="px-5 py-8 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-700">
                Classification confirmed
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                {result.label} &middot;{" "}
                {Math.round(result.confidence * 100)}% confidence
              </p>
              <button
                onClick={handleReset}
                className="mt-5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Classify another document
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-16 text-[11px] text-neutral-300">
        Classification powered by Claude &middot; Results are estimates, not
        guarantees
      </p>
    </main>
  );
}
