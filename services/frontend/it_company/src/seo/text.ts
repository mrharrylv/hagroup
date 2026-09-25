const ELLIPSIS = '…';
/** Stripped before the ellipsis: spaces, list punctuation, the em dash, the en dash and the hyphen. */
const TRAILING_PUNCTUATION = /[\s,;:.—–-]+$/;

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/** The longest run of leading sentences that fits in `max`, or ''. */
function wholeSentencesWithin(sentences: readonly string[], max: number): string {
  const runs = sentences.map((_, index) => sentences.slice(0, index + 1).join(' '));
  const fitting = runs.filter((run) => run.length <= max);
  return fitting.length > 0 ? fitting[fitting.length - 1] : '';
}

function cutAtWord(text: string, max: number): string {
  const room = text.slice(0, max);
  const lastSpace = room.lastIndexOf(' ');
  const cut = lastSpace > 0 ? room.slice(0, lastSpace) : room.slice(0, max - ELLIPSIS.length);
  return `${cut.replace(TRAILING_PUNCTUATION, '')}${ELLIPSIS}`;
}

/**
 * Shortens prose to a meta description: whole sentences while they fit in
 * `max`, otherwise a cut at a word boundary with an ellipsis. A summary
 * shorter than `min` is not trusted to describe the page, so it falls back
 * to the word cut, which uses the whole budget.
 */
export function summarize(text: string, max: number, min = 0): string {
  const clean = collapseWhitespace(text);
  if (clean.length <= max) return clean;
  const sentences = wholeSentencesWithin(splitSentences(clean), max);
  if (sentences.length >= min && sentences.length > 0) return sentences;
  return cutAtWord(clean, max);
}

/** The part of a page title before the " | Site" suffix, for a breadcrumb. */
export function crumbName(title: string): string {
  const [head] = title.split(' | ');
  return head.trim();
}
