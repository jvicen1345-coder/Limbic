import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

// Same size-cap convention as MAX_ZIP_BYTES in lib/apple-health-import.ts — a lecture
// slide deck PDF is realistically a few MB; 20 MB covers a heavy, image-dense deck without
// letting someone hand the extraction step (and the AI call after it) an unbounded file.
export const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB

export class PdfTextError extends Error {}

/** Extracts plain text from a PDF's pages (see generateSlideBreakdownFromPdf in
 *  app/actions/slide-breakdown.ts, the only caller) — unpdf wraps pdf.js without any
 *  Node-native/canvas dependency for the text-only path, so it runs fine in a Vercel
 *  serverless function, unlike most other PDF libraries. Returns joined page text; throws
 *  PdfTextError for a corrupt file or a PDF with no extractable text (e.g. scanned slides
 *  with no OCR layer — this app has no OCR, same "read what's actually selectable text"
 *  scope as everywhere else in the app that reads a pasted-in document). */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  let text: string;
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf, { mergePages: true });
    text = result.text.trim();
  } catch (error) {
    throw new PdfTextError(error instanceof Error ? `Could not read that PDF: ${error.message}` : "Could not read that PDF.");
  }

  if (!text) {
    throw new PdfTextError("No selectable text found in that PDF — if it's scanned slides or images, paste the text instead.");
  }
  return text;
}
