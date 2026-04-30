export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Converts heading text to a slug compatible with rehype-slug / GitHub Slugger.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars except hyphens
    .replace(/[\s_]+/g, "-")    // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

/**
 * Parses h2 and h3 headings from raw MDX/Markdown content.
 * Returns headings in document order with de-duplicated IDs (same algorithm
 * as github-slugger used by rehype-slug).
 */
export function extractHeadings(content: string): Heading[] {
  const pattern = /^(#{2,3})\s+(.+)$/gm;
  const seen = new Map<string, number>();
  const headings: Heading[] = [];

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    // Strip inline MDX/HTML tags and backticks from heading text
    const rawText = match[2]
      .replace(/<[^>]+>/g, "")    // strip HTML tags
      .replace(/`([^`]+)`/g, "$1") // strip backtick code spans
      .trim();

    const baseSlug = slugify(rawText);
    const count = seen.get(baseSlug) ?? 0;
    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    seen.set(baseSlug, count + 1);

    headings.push({ id, text: rawText, level });
  }

  return headings;
}
