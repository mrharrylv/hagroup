// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { i18n as I18n } from 'i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocaleContextValue } from './LocaleContext';
import type { Lang } from './locales';
import { LANG_STORAGE_KEY, useLocaleRouting } from './useLocaleRouting';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let locale: LocaleContextValue | null = null;

function Probe({ i18n, initialLang }: { i18n: I18n; initialLang: Lang }) {
  locale = useLocaleRouting(i18n, initialLang);
  return null;
}

function mount(path: string, initialLang: Lang): { changeLanguage: ReturnType<typeof vi.fn> } {
  window.history.replaceState(null, '', path);
  const changeLanguage = vi.fn(() => Promise.resolve());
  const i18n = { changeLanguage } as unknown as I18n;
  root = createRoot(document.createElement('div'));
  act(() => root?.render(<Probe i18n={i18n} initialLang={initialLang} />));
  return { changeLanguage };
}

function current(): LocaleContextValue {
  if (!locale) throw new Error('not mounted');
  return locale;
}

describe('useLocaleRouting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    locale = null;
  });

  it('remembers a language the visitor picks and moves to its URL', () => {
    mount('/services/devops?x=1#faq', 'en');
    act(() => current().switchLanguage('lv'));
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/lv/services/devops?x=1#faq');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('lv');
    expect(current().lang).toBe('lv');
    expect(document.documentElement.lang).toBe('lv');
  });

  it('saves the language already shown without moving or reloading the copy', () => {
    // Latvian was saved earlier; the visitor reads an English page and picks EN.
    localStorage.setItem(LANG_STORAGE_KEY, 'lv');
    const { changeLanguage } = mount('/services/devops?x=1#faq', 'en');
    const historyLength = window.history.length;

    act(() => current().switchLanguage('en'));

    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/services/devops?x=1#faq');
    expect(window.history.length).toBe(historyLength);
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(current().lang).toBe('en');
  });

  it('moves to the page it is given instead, without ?query or #hash', () => {
    // The not-found view sends the switcher to each language's home page.
    mount('/lv/nope?x=1#faq', 'lv');
    act(() => current().switchLanguage('ru', '/'));
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/ru');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ru');
    expect(current().lang).toBe('ru');
  });

  it('follows Back into another language without changing the remembered choice', () => {
    mount('/lv/services/devops', 'lv');
    act(() => current().switchLanguage('en'));
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');

    // Back to the Latvian page.
    act(() => {
      window.history.replaceState(null, '', '/lv/services/devops');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(current().lang).toBe('lv');
    expect(document.documentElement.lang).toBe('lv');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
  });
});
