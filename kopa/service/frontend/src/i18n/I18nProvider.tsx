import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { I18nContext, type I18nValue } from './context';
import { LV } from './dictionary';
import type { Lang, Localised } from '../domain/types';

const STORAGE_KEY = 'kopa.lang.v1';

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'lv' || stored === 'en' ? stored : 'en';
  } catch {
    return 'en';
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A demo that cannot remember the language is still a working demo.
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key: string, english: string) => (lang === 'lv' ? (LV[key] ?? english) : english),
      loc: (localised: Localised) => localised[lang] ?? localised.en,
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
