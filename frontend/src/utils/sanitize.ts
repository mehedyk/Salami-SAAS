import DOMPurify from 'dompurify'

// ─── Text sanitization ────────────────────────────────────────────────────────

/**
 * Strip all HTML — use for plain text fields (names, notes, etc.)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}

/**
 * Allow only safe inline formatting — use for bio fields
 */
export function sanitizeRichText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
  }).trim()
}

/**
 * Sanitize a URL — rejects javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) return ''
  return trimmed
}

// ─── Object deep-sanitize ────────────────────────────────────────────────────

type PlainObject = Record<string, unknown>

/**
 * Recursively sanitize all string values in a plain object.
 * Prevents stored XSS from slipping through form data.
 */
export function sanitizeObject(obj: PlainObject): PlainObject {
  const result: PlainObject = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as PlainObject)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeText(item)
          : item && typeof item === 'object'
          ? sanitizeObject(item as PlainObject)
          : item
      )
    } else {
      result[key] = value
    }
  }
  return result
}
