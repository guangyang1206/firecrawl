export const PDF_SNIFF_WINDOW = 1024;

const PDF_MAGIC = Buffer.from("%PDF");

/** Check if a buffer contains the %PDF magic bytes within the first 1KB. */
export function isPdfBuffer(buf: Buffer): boolean {
  const window = buf.subarray(0, Math.min(buf.length, PDF_SNIFF_WINDOW));
  return window.includes(PDF_MAGIC);
}

/**
 * Heuristic: given the HTTP content-type header value, decide whether
 * the PDF feature should be removed so the scrape loop retries with
 * regular HTML-capable engines.
 *
 * Returns `true` when the content-type strongly suggests a non-PDF
 * response (e.g. the server returned an HTML page instead of a raw
 * PDF blob).  Returns `false` when the content-type is either a real
 * PDF type or unrecognised (fail-safe – we don't want to drop the
 * PDF engine for unknown types).
 */
export function shouldRemovePdfFeatureForContentType(
  contentType: string | null | undefined,
): boolean {
  if (!contentType) return false;   // unknown → keep PDF engine
  const ct = contentType.toLowerCase().trim();
  // Definitely PDF – keep the feature
  if (ct === "application/pdf" || ct === "application/octet-stream") return false;
  // HTML or any text/* type – the .pdf URL returned an HTML/page → drop PDF
  if (ct.startsWith("text/") || ct === "application/xhtml+xml") return true;
  return false;
}
