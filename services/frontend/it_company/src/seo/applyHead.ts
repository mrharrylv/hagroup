import type { HeadTag } from './headTags';

const MANAGED_SELECTOR = '[data-seo]';

/** Makes an element's attributes exactly `attrs`. */
function syncAttributes(element: Element, attrs: Readonly<Record<string, string>>): void {
  Array.from(element.attributes)
    .filter((attribute) => !(attribute.name in attrs))
    .forEach((attribute) => element.removeAttribute(attribute.name));
  Object.entries(attrs).forEach(([name, value]) => {
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  });
}

function syncText(element: Element, text: string | undefined): void {
  if (text !== undefined && element.textContent !== text) element.textContent = text;
}

function createTag(doc: Document, tag: HeadTag): Element {
  const element = doc.createElement(tag.tag);
  syncAttributes(element, tag.attrs);
  syncText(element, tag.text);
  return element;
}

/**
 * Brings the managed tags in <head> in line with `tags`, updating each one in
 * place. Tags the new page does not have (a canonical on the 404 page, an
 * old hreflang) are removed, as are duplicates; unmanaged tags are left alone.
 */
export function applyHeadTags(doc: Document, tags: readonly HeadTag[]): void {
  const wanted = new Map(tags.map((tag) => [tag.key, tag]));
  const existing = new Map<string, Element>();

  Array.from(doc.head.querySelectorAll(MANAGED_SELECTOR)).forEach((element) => {
    const key = element.getAttribute('data-seo') ?? '';
    const tag = wanted.get(key);
    const reusable = tag && !existing.has(key) && element.tagName.toLowerCase() === tag.tag;
    if (reusable) existing.set(key, element);
    else element.remove();
  });

  tags.forEach((tag) => {
    const element = existing.get(tag.key);
    if (element) {
      syncAttributes(element, tag.attrs);
      syncText(element, tag.text);
    } else {
      doc.head.appendChild(createTag(doc, tag));
    }
  });
}
