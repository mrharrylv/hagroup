import { describe, expect, it } from 'vitest';
import enStatic from './locales/en/1_static.json';
import lvStatic from './locales/lv/1_static.json';
import ruStatic from './locales/ru/1_static.json';
import enSeo from './locales/en/6_seo.json';
import lvSeo from './locales/lv/6_seo.json';
import ruSeo from './locales/ru/6_seo.json';

/** Every key path in a JSON tree, arrays included by index. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => keyPaths(item, `${prefix}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => [
      `${prefix}.${key}`,
      ...keyPaths(child, `${prefix}.${key}`),
    ]);
  }
  return [];
}

/**
 * i18next plural keys legitimately differ per language (Latvian has _zero,
 * Russian _few and _many), so they are compared by their base key.
 */
function comparableKeys(value: unknown): string[] {
  const base = keyPaths(value).map((key) => key.replace(/_(zero|one|two|few|many|other)$/, ''));
  return [...new Set(base)].sort();
}

describe('locale files stay key-identical', () => {
  it.each([
    ['1_static.json', enStatic, lvStatic, ruStatic],
    ['6_seo.json', enSeo, lvSeo, ruSeo],
  ])('%s', (_name, en, lv, ru) => {
    const expected = comparableKeys(en);
    expect(comparableKeys(lv)).toEqual(expected);
    expect(comparableKeys(ru)).toEqual(expected);
  });

  it('has the not-found page copy in every language', () => {
    for (const locale of [enStatic, lvStatic, ruStatic]) {
      expect(locale.notFound.title.length).toBeGreaterThan(0);
      expect(locale.notFound.text.length).toBeGreaterThan(0);
      expect(locale.notFound.homeLink.length).toBeGreaterThan(0);
    }
  });
});
