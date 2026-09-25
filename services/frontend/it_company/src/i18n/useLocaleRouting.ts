import { useCallback, useInsertionEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import type { i18n as I18n } from 'i18next';
import type { LocaleContextValue } from './LocaleContext';
import { localeFromPath, localizePath, stripLocale, type Lang } from './locales';

/**
 * The language the visitor last picked in the switcher. The inline script in
 * index.html reads it to send a returning visitor from the bare home URL to
 * theirs. Only an explicit pick writes it: landing on /lv or going Back to it
 * does not.
 */
export const LANG_STORAGE_KEY = 'cloudie-lang';

function rememberLanguage(lang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage blocked (private mode): the choice is just not remembered.
  }
}

/**
 * The browser side of locale URLs. Switching language moves to the same page
 * under the other prefix (/services/devops -> /lv/services/devops), keeping
 * ?query and #hash, and pushes a history entry so Back returns to the page in
 * the language it was in. The router is keyed on the language by the caller,
 * so it remounts with the new basename.
 */
export function useLocaleRouting(i18n: I18n, initialLang: Lang): LocaleContextValue {
  const [lang, setLang] = useState<Lang>(initialLang);

  const showLanguage = useCallback(
    (next: Lang) => {
      i18n.changeLanguage(next).catch((error: unknown) => {
        console.error('[i18n] Failed to change language:', error);
      });
      // Screen readers pick their voice from this. WCAG 3.1.1.
      document.documentElement.lang = next;
      setLang(next);
    },
    [i18n],
  );

  const switchLanguage = useCallback(
    (code: Lang, page?: string) => {
      rememberLanguage(code);
      // The language already shown: the pick is saved, and nothing moves.
      if (code === lang) return;
      const { pathname, search, hash } = window.location;
      const current = `${pathname}${search}${hash}`;
      const target = page === undefined
        ? `${localizePath(stripLocale(pathname), code)}${search}${hash}`
        : localizePath(page, code);
      if (target !== current) window.history.pushState(null, '', target);
      showLanguage(code);
    },
    [lang, showLanguage],
  );

  // Back and Forward across a language boundary: follow the URL, and keep
  // the remembered choice, which only the switcher sets. The router for the
  // new language has to be in place before any router sees the new URL: the
  // old one cannot match it (its basename is the old prefix) and would render
  // nothing, or the not-found page. popstate listeners on window run in the
  // order they were added (Chromium runs a capture listener at window no
  // earlier), and BrowserRouter adds its own in a layout effect. An insertion
  // effect runs before every layout effect of the same commit, so this
  // listener comes first on mount and after each switch alike; flushSync then
  // swaps the router in before it returns, and the old router's listener is
  // removed before its turn.
  useInsertionEffect(() => {
    const onPopState = () => {
      const next = localeFromPath(window.location.pathname);
      if (next !== lang) flushSync(() => showLanguage(next));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [lang, showLanguage]);

  return useMemo(() => ({ lang, switchLanguage }), [lang, switchLanguage]);
}
