import { createContext } from 'react';
import type { Lang } from './locales';

export interface LocaleContextValue {
  /** Language of the current URL. */
  lang: Lang;
  /** Moves to the same page in another language. */
  switchLanguage: (code: Lang) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
