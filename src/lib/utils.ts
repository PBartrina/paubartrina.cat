/**
 * Safely serialises an object for injection into a <script type="application/ld+json">.
 * Escapes `<` as `\u003c` to prevent </script> breakout XSS.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/**
 * Converts a string to a URL-safe slug.
 * - Lowercases the string
 * - Strips diacritics (è→e, à→a, ç→c, etc.)
 * - Replaces non-alphanumeric sequences with a single hyphen
 * - Strips leading and trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
