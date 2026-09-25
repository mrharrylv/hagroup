import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

/**
 * The first inline script in index.html, run as a browser runs it before the
 * first paint: it picks the theme, trims the URL and may move a returning
 * visitor to their language. It is tested as shipped, from the file's text.
 */

const ORIGIN = 'https://www.hagroup.lv';
const INDEX_HTML = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf8');

function bootScript(): string {
  const scripts = [...INDEX_HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const script = scripts.find((text) => text.includes('cloudie-theme'));
  if (!script) throw new Error('index.html has no inline boot script');
  return script;
}

interface BootInput {
  /** Path, query and hash the visitor opened. */
  url: string;
  storage?: Readonly<Record<string, string>> | 'blocked';
  referrer?: string;
  navigationType?: 'navigate' | 'reload' | 'back_forward';
  prefersDark?: boolean;
}

interface BootOutput {
  /** Path, query and hash after the script ran. */
  url: string;
  lang: string;
  classes: string[];
  /** Every URL passed to history.replaceState. */
  replaced: string[];
}

function boot(input: BootInput): BootOutput {
  // Joined, not resolved: '//x' opened on this site is the path //x, not host x.
  let current = new URL(`${ORIGIN}${input.url}`);
  const classes = new Set<string>();
  const replaced: string[] = [];
  const documentElement = {
    lang: 'en',
    classList: {
      add: (name: string) => { classes.add(name); },
      remove: (name: string) => { classes.delete(name); },
      contains: (name: string) => classes.has(name),
    },
  };
  const storage = input.storage ?? {};
  const localStorage = {
    getItem(key: string): string | null {
      if (storage === 'blocked') throw new Error('SecurityError: storage is disabled');
      return storage[key] ?? null;
    },
  };
  const location = {
    get origin() { return current.origin; },
    get pathname() { return current.pathname; },
    get search() { return current.search; },
    get hash() { return current.hash; },
  };
  const history = {
    state: null,
    replaceState(_state: unknown, _title: string, next: string) {
      const target = new URL(next, current);
      // Browsers refuse to move the URL to another origin.
      if (target.origin !== current.origin) throw new Error(`SecurityError: cannot replaceState to ${target.href}`);
      replaced.push(next);
      current = target;
    },
  };
  const performance = {
    getEntriesByType: (type: string) => (type === 'navigation' ? [{ type: input.navigationType ?? 'navigate' }] : []),
  };
  const window = { matchMedia: () => ({ matches: input.prefersDark ?? true }) };

  runInNewContext(bootScript(), {
    document: { documentElement, referrer: input.referrer ?? '' },
    localStorage,
    location,
    history,
    performance,
    window,
    setTimeout: () => 0,
  });

  return {
    url: `${current.pathname}${current.search}${current.hash}`,
    lang: documentElement.lang,
    classes: [...classes].sort(),
    replaced,
  };
}

describe('index.html boot script: language', () => {
  const lv = { 'cloudie-lang': 'lv' };

  it('moves a visitor who chose Latvian or Russian from the bare home URL to theirs', () => {
    expect(boot({ url: '/', storage: lv })).toMatchObject({ url: '/lv', lang: 'lv' });
    expect(boot({ url: '/', storage: { 'cloudie-lang': 'ru' } })).toMatchObject({ url: '/ru', lang: 'ru' });
    expect(boot({ url: '/?utm=x#contact', storage: lv }).url).toBe('/lv?utm=x#contact');
    expect(boot({ url: '/', storage: lv, referrer: 'https://www.google.com/' }).url).toBe('/lv');
    expect(boot({ url: '/', storage: lv }).classes).toContain('reroute-hide');
  });

  it('never overrides a deeper URL the visitor opened', () => {
    // A shared link, a search result, or the switcher's EN link opened in a new tab.
    for (const referrer of ['', 'https://www.google.com/', `${ORIGIN}/lv/services/devops`]) {
      const result = boot({ url: '/services/devops', storage: lv, referrer });
      expect(result, referrer).toMatchObject({ url: '/services/devops', lang: 'en', replaced: [] });
      expect(result.classes).not.toContain('reroute-hide');
    }
  });

  it('opens the home page in English when the visitor came from this site', () => {
    // The switcher's EN link on /lv, middle-clicked or opened in a new tab.
    expect(boot({ url: '/', storage: lv, referrer: `${ORIGIN}/lv` })).toMatchObject({ url: '/', lang: 'en', replaced: [] });
    expect(boot({ url: '/', storage: lv, referrer: `${ORIGIN}/lv/contact?x=1` })).toMatchObject({ url: '/', lang: 'en' });
  });

  it('shows the home page as it was on a reload or Back', () => {
    expect(boot({ url: '/', storage: lv, navigationType: 'reload' })).toMatchObject({ url: '/', lang: 'en', replaced: [] });
    expect(boot({ url: '/', storage: lv, navigationType: 'back_forward' })).toMatchObject({ url: '/', lang: 'en', replaced: [] });
  });

  it('stays on the URL as opened without a Latvian or Russian choice, or without storage', () => {
    expect(boot({ url: '/', storage: { 'cloudie-lang': 'en' } })).toMatchObject({ url: '/', lang: 'en', replaced: [] });
    expect(boot({ url: '/', storage: { 'cloudie-lang': 'de' } })).toMatchObject({ url: '/', lang: 'en', replaced: [] });
    expect(boot({ url: '/', storage: 'blocked' })).toMatchObject({ url: '/', lang: 'en', replaced: [] });
  });

  it('takes the language of a prefixed URL, whatever was saved', () => {
    expect(boot({ url: '/lv/services', storage: { 'cloudie-lang': 'ru' } })).toMatchObject({ url: '/lv/services', lang: 'lv', replaced: [] });
    expect(boot({ url: '/ru', storage: lv })).toMatchObject({ url: '/ru', lang: 'ru', replaced: [] });
  });
});

describe('index.html boot script: theme and URL', () => {
  it('applies the stored theme, or the device preference', () => {
    expect(boot({ url: '/', storage: { 'cloudie-theme': 'light' } }).classes).toContain('light');
    expect(boot({ url: '/', storage: { 'cloudie-theme': 'dark' }, prefersDark: false }).classes).toContain('dark');
    expect(boot({ url: '/', prefersDark: false }).classes).toContain('light');
    expect(boot({ url: '/', prefersDark: true }).classes).toContain('dark');
    expect(boot({ url: '/', storage: 'blocked' }).classes).toContain('light');
  });

  it('drops a trailing slash', () => {
    expect(boot({ url: '/services/devops/?a=1#b' })).toMatchObject({ url: '/services/devops?a=1#b', replaced: ['/services/devops?a=1#b'] });
    expect(boot({ url: '/lv/' })).toMatchObject({ url: '/lv', lang: 'lv' });
    expect(boot({ url: '/services/devops' }).replaced).toEqual([]);
  });

  it('collapses leading slashes, so the URL never names another host', () => {
    // Before, replaceState('//evil.example') threw a SecurityError and the
    // rest of the script (language, <html lang>) never ran.
    expect(boot({ url: '//evil.example/' })).toMatchObject({ url: '/evil.example', lang: 'en', replaced: ['/evil.example'] });
    expect(boot({ url: '//evil.example?a=1#b' })).toMatchObject({ url: '/evil.example?a=1#b', replaced: ['/evil.example?a=1#b'] });
    expect(boot({ url: '///lv//services' })).toMatchObject({ url: '/lv//services', lang: 'lv' });
    expect(boot({ url: '//' })).toMatchObject({ url: '/', lang: 'en' });
    expect(boot({ url: '//', storage: { 'cloudie-lang': 'ru' } })).toMatchObject({ url: '/ru', lang: 'ru' });
  });
});
