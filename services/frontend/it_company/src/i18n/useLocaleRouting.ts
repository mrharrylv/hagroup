import { useCallback, useEffect, useMemo, useState } from 'react';
import type { i18n as I18n } from 'i18next';
import type { LocaleContextValue } from './LocaleContext';
import { localeFromPath, localizePath, stripLocale, type Lang } from './locales';

/** Read by the inline script in index.html to send returning visitors to their language. */
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
      rememberLanguage(next);
      setLang(next);
    },
    [i18n],
  );

  const switchLanguage = useCallback(
    (code: Lang) => {
      const { pathname, search, hash } = window.location;
      const current = `${pathname}${search}${hash}`;
      const target = `${localizePath(stripLocale(pathname), code)}${search}${hash}`;
      if (target !== current) window.history.pushState(null, '', target);
      showLanguage(code);
    },
    [showLanguage],
  );

  // Back and Forward across a language boundary: follow the URL.
  useEffect(() => {
    const onPopState = () => {
      const next = localeFromPath(window.location.pathname);
      if (next !== lang) showLanguage(next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [lang, showLanguage]);

  return useMemo(() => ({ lang, switchLanguage }), [lang, switchLanguage]);
}
