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

const SOURCES = Object.entries(MODULES).filter(
  ([path]) => !/\.test\.tsx?$/.test(path) && !path.includes('/i18n/'),
);

const USAGES: Usage[] = SOURCES.flatMap(([path, source]) =>
  [...source.matchAll(CALL)].map((match) => ({
    key: match[1],
    english: (match[2] ?? match[3] ?? match[4] ?? '').replace(/\s+/g, ' ').trim(),
    file: path.replace(/^\.{1,2}\//, ''),
  })),
);

const LITERAL_KEYS = new Set(USAGES.map((usage) => usage.key));

/**
 * Not every key reaches `t()` as a literal pair. `badges.ts` builds
 * `status.${status}` from a union; `labels.ts` builds `sort.${key}`; and
 * `WhySuppliersWin.tsx` keeps `[key, english]` tuples in a table and spreads
 * them — `t(...card.title)`. Each of those shapes is invisible to the pair
 * regex above, and each one silently rendered English until it was found by
 * hand.
 *
 * So the scan is deliberately wider than `t()`: any dotted lowercase string
 * literal whose first segment is a namespace the app already uses is treated
 * as a translation key, wherever it appears. Import specifiers are excluded —
 * they are paths, not keys.
 */
const NAMESPACES = new Set([
  ...[...LITERAL_KEYS].map((key) => key.split('.')[0]),
  ...Object.keys(LV).map((key) => key.split('.')[0]),
]);

const DOTTED_LITERAL = /['"]([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_-]+)+)['"]/g;

const REFERENCED_KEYS = new Set(
  SOURCES.flatMap(([, source]) =>
    source
      .split('\n')
      .filter((line) => !/^\s*(?:import|export)\s.*\sfrom\s/.test(line))
      .flatMap((line) =>
        [...line.matchAll(DOTTED_LITERAL)]
          .map((match) => match[1])
          .filter((key) => NAMESPACES.has(key.split('.')[0])),
      ),
  ),
);

/**
 * Prefixes whose full key set is generated from a TypeScript union rather than
 * written out. Every member of the union must still be translated, which the
 * dedicated tests below check against the union's own values.
 */
const GENERATED_PREFIXES = ['status.', 'sort.'];

const KEYS = [...new Set([...LITERAL_KEYS, ...REFERENCED_KEYS])].sort();

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
    const orphans = Object.keys(LV).filter(
      (key) =>
        !REFERENCED_KEYS.has(key) &&
        !LITERAL_KEYS.has(key) &&
        !GENERATED_PREFIXES.some((prefix) => key.startsWith(prefix)),
    );
    expect(orphans, 'dead dictionary entries drift out of date unnoticed').toEqual([]);
  });

  it('has a generated-key test for every template key in the source', () => {
    // The two tests below only help while they cover every dynamic key there
    // is. A new `t(`thing.${x}`)` anywhere in the app must arrive with its own
    // coverage test, not slip past the literal-key scan into English.
    const TEMPLATE_CALL = /\bt\(\s*`([a-z][\w.-]*)\.\$\{/gi;
    const KEY_LITERAL = /\bkey:\s*`([a-z][\w.-]*)\.\$\{/gi;

    const prefixes = new Set(
      Object.entries(MODULES)
        .filter(([path]) => !/\.test\.tsx?$/.test(path))
        .flatMap(([, source]) => [
          ...[...source.matchAll(TEMPLATE_CALL)].map((m) => `${m[1]}.`),
          ...[...source.matchAll(KEY_LITERAL)].map((m) => `${m[1]}.`),
        ]),
    );

    expect([...prefixes].sort()).toEqual([...GENERATED_PREFIXES].sort());
  });

  it('translates every sort option', () => {
    const SORT_KEYS = ['ending-soon', 'most-joined', 'best-saving', 'newest', 'closest-to-goal'];
    const missing = SORT_KEYS.filter((key) => LV[`sort.${key}`] === undefined);
    expect(missing, 'a sort option would render in English').toEqual([]);
  });

  it('translates every status a campaign can be in', () => {
    // badges.ts turns CampaignStatus into `status.${status}`, so the union and
    // the dictionary have to stay in step without the regex ever seeing them.
    const STATUSES = ['new', 'open', 'almost-full', 'closing-soon', 'funded', 'closed'];
    const missing = STATUSES.filter((status) => LV[`status.${status}`] === undefined);
    expect(missing, 'a status badge would render in English').toEqual([]);
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
