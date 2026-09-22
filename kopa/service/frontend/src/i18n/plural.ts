import type { Lang } from '../domain/types';

/**
 * "1 days left" is the kind of sloppiness a reader notices before anything
 * else on the page, and Latvian is stricter about it than English: the
 * singular comes back for 21, 31, 101 and so on, but not for 11.
 *
 * English: 1 is singular, everything else plural.
 * Latvian: n mod 10 is 1 and n mod 100 is not 11 → singular; otherwise plural.
 *          (Latvian also has a genitive-plural form after 0, which this demo
 *          does not need: a count of zero is never rendered with a noun.)
 */
export function isSingular(count: number, lang: Lang): boolean {
  const n = Math.abs(Math.trunc(count));
  if (lang === 'lv') return n % 10 === 1 && n % 100 !== 11;
  return n === 1;
}

export function plural(count: number, lang: Lang, forms: { one: string; many: string }): string {
  return isSingular(count, lang) ? forms.one : forms.many;
}
