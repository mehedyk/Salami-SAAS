import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitizeInput(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeHTML(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href"],
  });
}

export function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
}
