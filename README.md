# DocValidator

A full-stack Next.js application that classifies uploaded documents in under 5 seconds. Upload a PDF, PNG, or JPG and get an auto-detected document type (e.g. "Electric Bill", "W-2 Tax Form", "Auto Insurance Policy") with a confidence score and reasoning — no predefined categories, the AI figures it out from the content.

Built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, and Claude Haiku 4.5.

## Features

- **Auto-classification** — no fixed category list; Claude analyzes keywords, structure, and context to determine the document type
- **Two-path extraction** — automatically chooses the fastest method:
  - Text extraction for native PDFs (~1s)
  - Vision analysis for scanned PDFs and images (~2-3s)
- **Accept or dispute** — confirm the classification or submit a correction
- **Responsive UI** — works on desktop and mobile
- **Vercel-ready** — serverless, no filesystem dependencies

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

```bash
git clone https://github.com/SinfulSoul007/DocValidator.git
cd docvalidator
npm install
```

Create your environment file:

```bash
cp .env.example .env.local
```

Add your API key to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| PDF text extraction | pdfjs-dist v3 (legacy build, serverless-compatible) |
| Classification | Claude Haiku 4.5 via `@anthropic-ai/sdk` |
| Deployment | Vercel (serverless functions) |

## Project Structure

```
docvalidator/
├── app/
│   ├── layout.tsx                # Root layout with Geist fonts
│   ├── page.tsx                  # Main page — state machine (idle → processing → result)
│   ├── globals.css               # Tailwind base styles
│   └── api/classify/route.ts     # POST endpoint — file validation + classification
├── components/
│   ├── DropZone.tsx              # Drag-and-drop upload with spinner
│   ├── ResultCard.tsx            # Classification result display
│   └── DisputeForm.tsx           # Correction form
├── lib/
│   ├── classifier.ts             # Core logic — three-path classification
│   ├── extractor.ts              # PDF text extraction via pdfjs-dist
│   └── prompts.ts                # Classification prompt templates
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── next.config.ts                # serverExternalPackages for pdfjs-dist
├── .env.example
└── package.json
```

## Architecture

```
              ┌─────────────┐
              │   Browser    │
              │  (DropZone)  │
              └──────┬──────┘
                     │ POST /api/classify (multipart form, max 4.5MB)
                     ▼
          ┌────────────────────┐
          │   API Route        │
          │   Validate file    │
          │   Detect mime type │
          └──┬─────┬─────┬────┘
             │     │     │
     ┌───────┘     │     └────────┐
     ▼             ▼              ▼
┌─────────┐ ┌───────────┐ ┌────────────┐
│ PNG/JPG │ │ Native PDF│ │Scanned PDF │
│         │ │           │ │            │
│ base64  │ │ pdfjs-dist│ │ raw PDF    │
│ encode  │ │ getText() │ │ base64     │
│         │ │ (2 pages) │ │ encode     │
└────┬────┘ └─────┬─────┘ └─────┬──────┘
     │            │              │
     ▼            ▼              ▼
┌─────────┐ ┌─────────┐  ┌───────────┐
│ Claude  │ │ Claude  │  │ Claude    │
│ Vision  │ │ Text    │  │ Document  │
│ (image) │ │ (text)  │  │ (PDF)     │
└────┬────┘ └────┬────┘  └─────┬─────┘
     │           │              │
     └───────────┼──────────────┘
                 ▼
          ┌────────────┐
          │ JSON result│
          │  label     │
          │  confidence│
          │  reasoning │
          └────────────┘
```

**Path A — Images (~1s):** PNG/JPG files are base64-encoded and sent to Claude's vision API.

**Path B — Native PDFs (~1s):** Text is extracted from the first 2 pages using pdfjs-dist. If >50 characters are found, the text is sent to Claude for classification.

**Path C — Scanned PDFs (~2-3s):** If no extractable text is found, the raw PDF is sent directly to Claude as a document block — no OCR or canvas rendering needed.

## API

### `POST /api/classify`

Accepts multipart form data with a single `file` field.

**Constraints:**
- Max file size: 4.5 MB
- Accepted types: `application/pdf`, `image/png`, `image/jpeg`

**Success response:**

```json
{
  "success": true,
  "result": {
    "label": "Electric Bill",
    "confidence": 0.95,
    "reasoning": "Document contains utility account number, kWh usage, and amount due from a power company.",
    "extractionMethod": "text",
    "processingTimeMs": 1150
  }
}
```

**Error response:**

```json
{
  "success": false,
  "error": "File too large. Maximum size is 4.5MB"
}
```

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add `ANTHROPIC_API_KEY` as an environment variable in Vercel project settings
4. Deploy

The API route runs as a serverless function with no filesystem dependencies. `pdfjs-dist` is configured as an external server package in `next.config.ts` for proper bundling.

## Configuration

- **Model:** `claude-haiku-4-5-20251001` — fast and cost-effective for classification (configurable in `lib/classifier.ts`)
- **Max tokens:** 128 — classification responses are small JSON
- **API timeout:** 6 seconds
- **Text extraction limit:** first 2 pages, max 3000 characters
- **File size limit:** 4.5 MB (Vercel serverless payload limit)
