import { createContext } from 'react';
import type { Lang } from './locales';

export interface LocaleContextValue {
  /** Language of the current URL. */
  lang: Lang;
  /**
   * Saves the visitor's pick and moves to the same page in that language,
   * keeping ?query and #hash, or to `page` (unprefixed) in it when given.
   * For the language already shown it only saves the pick.
   */
  switchLanguage: (code: Lang, page?: string) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
