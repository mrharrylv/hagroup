import { describe, expect, it } from 'vitest';
import { LV } from './dictionary';

/**
 * A missing translation fails silently: `t(key, english)` falls back to the
 * English text, so a half-translated page under the LV toggle still renders —
 * it just renders in the wrong language. This walks every `t()` call in the
 * source and refuses to let that happen quietly.
 */

const MODULES = import.meta.glob('../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** `t('some.key', 'English text')`, in single, double or backquoted form. */
const CALL = /\bt\(\s*'([^']+)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/gs;

interface Usage {
  readonly key: string;
  readonly english: string;
  readonly file: string;
}

const USAGES: Usage[] = Object.entries(MODULES)
  .filter(([path]) => !/\.test\.tsx?$/.test(path) && !path.includes('/i18n/'))
  .flatMap(([path, source]) =>
    [...source.matchAll(CALL)].map((match) => ({
      key: match[1],
      english: (match[2] ?? match[3] ?? match[4] ?? '').replace(/\s+/g, ' ').trim(),
      file: path.replace(/^\.{1,2}\//, ''),
    })),
  );

const KEYS = [...new Set(USAGES.map((usage) => usage.key))].sort();

describe('the Latvian dictionary', () => {
  it('finds the translation calls at all — the regex still matches the source', () => {
    expect(USAGES.length).toBeGreaterThan(300);
    expect(KEYS.length).toBeGreaterThan(300);
  });

  it('translates every key the app asks for', () => {
    const missing = KEYS.filter((key) => LV[key] === undefined);
    expect(missing, `${missing.length} key(s) fall back to English under the LV toggle`).toEqual([]);
  });

  it('carries no entry the app never asks for', () => {
    const used = new Set(KEYS);
    const orphans = Object.keys(LV).filter((key) => !used.has(key));
    expect(orphans, 'dead dictionary entries drift out of date unnoticed').toEqual([]);
  });

  it('never answers a key with the English string verbatim', () => {
    // A handful of terms are genuinely identical in both languages; anything
    // else matching character for character is untranslated copy hiding in the
    // dictionary rather than an honest gap.
    const IDENTICAL_IS_CORRECT = new Set([
      'lang.toggle',
      'filter.km',
      'create.field.emailPlaceholder',
      'create.field.phonePlaceholder',
      'create.field.companyPlaceholder',
      'create.field.contactNamePlaceholder',
    ]);

    const echoes = USAGES.filter(
      (usage) =>
        !IDENTICAL_IS_CORRECT.has(usage.key) &&
        usage.english.length > 3 &&
        LV[usage.key] === usage.english,
    ).map((usage) => `${usage.key} (${usage.file})`);

    expect([...new Set(echoes)]).toEqual([]);
  });

  it('uses Latvian orthography somewhere — a dictionary with no diacritics is English', () => {
    const withDiacritics = Object.values(LV).filter((value) => /[āčēģīķļņšūž]/i.test(value));
    expect(withDiacritics.length).toBeGreaterThan(Object.keys(LV).length * 0.3);
  });
});
