import type { Lang } from '../i18n/locales';
import { escapeAttribute } from './escape';

/** index.html marks the tags each page replaces with these two comments. */
export const SEO_HEAD_START = '<!--seo-head-->';
export const SEO_HEAD_END = '<!--/seo-head-->';
const EMPTY_ROOT = '<div id="root"></div>';

export interface PageDocumentInput {
  /** Managed <head> fragment from headHtml. */
  head: string;
  lang: Lang;
  /** The page's own URL path, stamped on #root for the client to compare. */
  url: string;
  /** Server-rendered markup of the app. */
  appHtml: string;
}

function replaceHead(template: string, head: string): string {
  const start = template.indexOf(SEO_HEAD_START);
  const end = template.indexOf(SEO_HEAD_END);
  if (start < 0 || end < start) {
    throw new Error(`index.html has no ${SEO_HEAD_START} ... ${SEO_HEAD_END} region`);
  }
  const lineStart = template.lastIndexOf('\n', end) + 1;
  const indent = /^\s*$/.test(template.slice(lineStart, end)) ? template.slice(lineStart, end) : '';
  const before = template.slice(0, start + SEO_HEAD_START.length);
  return `${before}\n${indent}${head}\n${indent}${template.slice(end)}`;
}

function setDocumentLang(html: string, lang: Lang): string {
  if (/<html\b[^>]*\slang="[^"]*"/.test(html)) {
    return html.replace(/(<html\b[^>]*\s)lang="[^"]*"/, (_match, prefix: string) => `${prefix}lang="${lang}"`);
  }
  return html.replace(/<html\b/, () => `<html lang="${lang}"`);
}

/** One page's HTML: dist/index.html with this page's head, language and markup. */
export function injectPage(template: string, input: PageDocumentInput): string {
  if (!template.includes(EMPTY_ROOT)) throw new Error(`index.html has no empty ${EMPTY_ROOT} root element`);
  const withHead = replaceHead(template, input.head);
  const withLang = setDocumentLang(withHead, input.lang);
  const root = `<div id="root" data-prerendered="${escapeAttribute(input.url)}">${input.appHtml}</div>`;
  return withLang.replace(EMPTY_ROOT, () => root);
}

export interface PageCheckInput {
  url: string;
  appHtml: string;
  head: string;
  /** Absolute canonical URL the page must declare; null when it must have none. */
  expectedCanonical: string | null;
  notFound: boolean;
}

function visibleText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** Problems that must fail the build, each naming the URL. Empty when the page is fine. */
export function validatePage(input: PageCheckInput): string[] {
  const { url, appHtml, head, expectedCanonical, notFound } = input;
  const errors: string[] = [];
  if (visibleText(appHtml) === '') errors.push(`${url}: rendered an empty #root`);

  const h1Count = (appHtml.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) errors.push(`${url}: expected exactly one <h1>, found ${h1Count} <h1>`);

  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(head)?.[1] ?? null;
  const expected = expectedCanonical === null ? null : escapeAttribute(expectedCanonical);
  if (canonical !== expected) {
    errors.push(`${url}: canonical is ${canonical ?? 'missing'}, expected ${expected ?? 'none'}`);
  }

  if (!notFound && appHtml.includes('data-not-found')) {
    errors.push(`${url}: rendered the not-found page; is the route missing from AppRoutes?`);
  }
  return errors;
}
