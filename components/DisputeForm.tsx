"use client";

import { useState } from "react";

interface DisputeFormProps {
  originalLabel: string;
  onClose: () => void;
}

export default function DisputeForm({
  originalLabel,
  onClose,
}: DisputeFormProps) {
  const [correctedLabel, setCorrectedLabel] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dispute submitted:", {
      originalLabel,
      correctedLabel,
      feedback: feedback || undefined,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
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
            Feedback recorded
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Thanks for helping improve classification accuracy.
          </p>
          <button
            onClick={onClose}
            className="mt-5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Dispute Classification
        </span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5">
        {/* Current classification */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase mb-1.5">
            Current classification
          </label>
          <div className="rounded-md bg-neutral-50 border border-neutral-100 px-3 py-2.5 text-sm text-neutral-500">
            {originalLabel}
          </div>
        </div>

        {/* Corrected type */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase mb-1.5">
            What type of document is this?
          </label>
          <input
            type="text"
            value={correctedLabel}
            onChange={(e) => setCorrectedLabel(e.target.value)}
            required
            placeholder="e.g. Electric Bill, W-2 Tax Form&hellip;"
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-300 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        </div>

        {/* Feedback */}
        <div className="mb-5">
          <label className="block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase mb-1.5">
            Additional feedback
            <span className="ml-1 normal-case tracking-normal text-neutral-300">
              (optional)
            </span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Anything else we should know&hellip;"
            rows={3}
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-300 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Submit correction
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
