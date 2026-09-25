/**
 * Which language a URL is in, and how to move a URL between languages.
 *
 * English lives at the root with the URLs it always had; Latvian and Russian
 * live under /lv and /ru with the same slugs (/lv/services/devops). The
 * language is a property of the URL, not of the visitor's storage, so every
 * language version is a separate, crawlable, linkable page.
 *
 * Pure: no window, no storage. Callers keep their own ?query and #hash.
 */

export const LOCALES = ['en', 'lv', 'ru'] as const;

export type Lang = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Lang = 'en';

const PREFIXED_LOCALES: readonly Lang[] = LOCALES.filter((lang) => lang !== DEFAULT_LOCALE);

const PREFIX_PATTERN = new RegExp(`^/(${PREFIXED_LOCALES.join('|')})(?=/|$)`);

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Exactly one leading slash. A path that starts with '//' (the URL
 * /lv//evil.example gives the Latvian router //evil.example) would be read as
 * another host by any link built from it.
 */
function withLeadingSlash(path: string): string {
  return `/${path.replace(/^\/+/, '')}`;
}

/** The language a pathname is in: its /lv or /ru prefix, English otherwise. */
export function localeFromPath(pathname: string): Lang {
  const match = PREFIX_PATTERN.exec(withLeadingSlash(pathname));
  return match && isLang(match[1]) ? match[1] : DEFAULT_LOCALE;
}

/** The pathname without its language prefix. Always starts with '/'. */
export function stripLocale(pathname: string): string {
  const path = withLeadingSlash(pathname);
  const rest = path.replace(PREFIX_PATTERN, '');
  return rest === '' ? '/' : withLeadingSlash(rest);
}

/** The router basename for a language: '' for English, '/lv' or '/ru' otherwise. */
export function basenameFor(lang: Lang): '' | '/lv' | '/ru' {
  if (lang === 'lv') return '/lv';
  if (lang === 'ru') return '/ru';
  return '';
}

/**
 * The same page in another language. Accepts an unprefixed or an already
 * prefixed path, so moving from /lv/x to Russian gives /ru/x.
 */
export function localizePath(path: string, lang: Lang): string {
  const unprefixed = stripLocale(path);
  const base = basenameFor(lang);
  if (base === '') return unprefixed;
  return unprefixed === '/' ? base : `${base}${unprefixed}`;
}

/** One spelling per page: leading slash, no trailing slash except the root. */
export function normalizePath(pathname: string): string {
  const trimmed = withLeadingSlash(pathname).replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}
