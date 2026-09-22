import { createContext } from 'react';
import type { Lang, Localised } from '../domain/types';

export interface I18nValue {
  readonly lang: Lang;
  readonly setLang: (lang: Lang) => void;
  /** Translate by key, falling back to the English text passed at the call site. */
  readonly t: (key: string, english: string) => string;
  /** Pick the current language out of a bilingual data field. */
  readonly loc: (value: Localised) => string;
}

export const I18nContext = createContext<I18nValue | null>(null);
