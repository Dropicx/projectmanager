/**
 * Strip HTML tags and decode HTML entities to get plain text
 * Safe for both client and server-side rendering
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  // Remove HTML tags using regex (SSR-safe)
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
    .replace(/&amp;/g, "&") // Replace ampersands
    .replace(/&lt;/g, "<") // Replace less than
    .replace(/&gt;/g, ">") // Replace greater than
    .replace(/&quot;/g, '"') // Replace quotes
    .replace(/&#39;/g, "'") // Replace apostrophes
    .replace(/&apos;/g, "'") // Replace apostrophes (alternate encoding)
    .replace(/&mdash;/g, "—") // Replace em dash
    .replace(/&ndash;/g, "–") // Replace en dash
    .replace(/&hellip;/g, "...") // Replace ellipsis
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
}

/**
 * Get a plain text excerpt from HTML content
 */
export function getContentExcerpt(htmlContent: string, maxLength: number = 150): string {
  const plainText = stripHtml(htmlContent);
  if (plainText.length <= maxLength) return plainText;

  // Try to cut at a word boundary
  const cutIndex = plainText.lastIndexOf(" ", maxLength);
  const actualCutIndex = cutIndex > 0 ? cutIndex : maxLength;

  return `${plainText.substring(0, actualCutIndex).trim()}...`;
}
