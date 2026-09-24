import { escapeAttribute, escapeText } from './escape';
import { headTags, type HeadTag } from './headTags';
import type { PageSeo } from './types';

export { escapeAttribute, escapeText, serializeJsonLd } from './escape';

function renderAttributes(attrs: Readonly<Record<string, string>>): string {
  return Object.entries(attrs)
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(' ');
}

function renderTag(tag: HeadTag): string {
  const attributes = renderAttributes(tag.attrs);
  switch (tag.tag) {
    case 'title':
      return `<title ${attributes}>${escapeText(tag.text ?? '')}</title>`;
    case 'script':
      // Already escaped for this context by serializeJsonLd.
      return `<script ${attributes}>${tag.text ?? ''}</script>`;
    default:
      return `<${tag.tag} ${attributes}>`;
  }
}

/** The managed <head> fragment of one page, one tag per line. */
export function headHtml(seo: PageSeo, indent = '    '): string {
  return headTags(seo).map(renderTag).join(`\n${indent}`);
}
