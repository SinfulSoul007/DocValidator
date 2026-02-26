"use client";

import { useCallback, useRef, useState } from "react";
import type { ClassificationResult, ApiResponse } from "@/types";

const MAX_SIZE = 4.5 * 1024 * 1024;
const ACCEPTED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPG",
};

interface DropZoneProps {
  onResult: (result: ClassificationResult) => void;
  onError: (msg: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

export default function DropZone({
  onResult,
  onError,
  isProcessing,
  setIsProcessing,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED.has(file.type)) {
        onError("Unsupported format. Upload a PDF, PNG, or JPG.");
        return;
      }
      if (file.size > MAX_SIZE) {
        onError("File exceeds 4.5 MB limit.");
        return;
      }

      setSelectedFile(file);
      setIsProcessing(true);

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/classify", {
          method: "POST",
          body: form,
        });

        const data: ApiResponse = await res.json();

        if (data.success && data.result) {
          onResult(data.result);
        } else {
          onError(data.error ?? "Classification failed.");
        }
      } catch {
        onError("Network error. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [onResult, onError, setIsProcessing]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`
        relative w-full rounded-lg border-2 border-dashed
        transition-all duration-200
        ${
          isDragOver
            ? "border-blue-500 bg-blue-500/5"
            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
        }
        ${isProcessing ? "pointer-events-none" : "cursor-pointer"}
      `}
      onClick={() => !isProcessing && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center px-6 py-14">
        {isProcessing ? (
          <>
            {/* Processing spinner */}
            <div className="mb-5 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-blue-500" />
            </div>
            <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
              Classifying document&hellip;
            </p>
            {selectedFile && (
              <p className="mt-2 text-xs text-neutral-400">
                {selectedFile.name}
              </p>
            )}
          </>
        ) : selectedFile ? (
          <>
            {/* File selected state */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-blue-500/10">
              <span className="text-xs font-bold tracking-widest text-blue-600">
                {FILE_ICONS[selectedFile.type] ?? "DOC"}
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-700">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {formatSize(selectedFile.size)} &middot; Ready
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mt-4 text-xs font-medium text-neutral-400 underline underline-offset-2 hover:text-neutral-600 transition-colors"
            >
              Choose a different file
            </button>
          </>
        ) : (
          <>
            {/* Empty state */}
            <div className="mb-5">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-300"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-600">
              Drop a document here
            </p>
            <p className="mt-1.5 text-xs text-neutral-400">
              PDF, PNG, or JPG &middot; Max 4.5 MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="mt-5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white tracking-wide transition-colors hover:bg-neutral-700"
            >
              Browse files
            </button>
          </>
        )}
      </div>
    </div>
  );
}
