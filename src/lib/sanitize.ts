// FIX: DOMPurify is a browser library. To use it safely on the server (in
// Next.js API routes / SSR), we must supply a DOM implementation via jsdom.
// The original code did this but had no error handling if jsdom wasn't
// installed, and no type guard for the window instance.
//
// This version:
//   1. Guards the jsdom import so it fails loudly if the package is missing.
//   2. Keeps ALLOWED_TAGS:[] for plain-text sanitization (strips ALL tags).
//   3. Adds sanitizeCardContent() — a single function to call before saving
//      any user-supplied card fields (customMessage, recipientName).
//   4. Keeps sanitizeHTML() for contexts where some formatting is intentional.
//   5. Keeps sanitizeSlug() unchanged.
//
// Make sure jsdom is installed:  npm install jsdom @types/jsdom

import DOMPurify from "dompurify";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require("jsdom") as typeof import("jsdom");

// Build a server-side DOMPurify instance once at module load.
// This is safe — jsdom's window is stateless for DOMPurify's purposes.
let purify: ReturnType<typeof DOMPurify>;
try {
  const { window } = new JSDOM("");
  purify = DOMPurify(window as unknown as typeof globalThis);
} catch (err) {
  throw new Error(
    "[sanitize.ts] Failed to initialise DOMPurify with jsdom. " +
      "Run `npm install jsdom @types/jsdom` and try again.\n" +
      String(err)
  );
}

/**
 * Strips ALL HTML tags and attributes from a plain-text string.
 * Use this for any user-supplied content that should never contain markup
 * (names, messages, transaction IDs, etc.).
 */
export function sanitizeInput(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * FIX: Convenience wrapper that sanitizes both free-text card fields in one
 * call. Import and use this in the cards API route before writing to the DB.
 *
 * Example:
 *   const safe = sanitizeCardContent({ customMessage, recipientName });
 *   // then use safe.customMessage and safe.recipientName
 */
export function sanitizeCardContent(fields: {
  customMessage: string;
  recipientName?: string;
}): { customMessage: string; recipientName?: string } {
  return {
    customMessage: sanitizeInput(fields.customMessage),
    recipientName: fields.recipientName
      ? sanitizeInput(fields.recipientName)
      : fields.recipientName,
  };
}

/**
 * Allows a small safe subset of HTML tags (b, i, em, strong, a).
 * Only use this when you intentionally want to render formatted HTML —
 * for example in notification messages you control, NOT for user input.
 */
export function sanitizeHTML(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href"],
  });
}

/**
 * Ensures a slug contains only lowercase alphanumeric characters and hyphens.
 * Any other character is removed.
 */
export function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
}
