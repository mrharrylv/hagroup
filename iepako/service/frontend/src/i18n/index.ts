import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import lv from './locales/lv.json';
import ru from './locales/ru.json';

export const supportedLanguages = ['lv', 'en', 'ru'] as const;
export type Language = (typeof supportedLanguages)[number];

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem('iepako-language');
    if (supportedLanguages.includes(stored as Language)) return stored as Language;
  } catch {
    // Browser storage can be unavailable in strict privacy modes.
  }

  const browserLanguage = navigator.language.slice(0, 2).toLowerCase();
  return supportedLanguages.includes(browserLanguage as Language)
    ? (browserLanguage as Language)
    : 'lv';
}

i18n.use(initReactI18next).init({
  resources: {
    lv: { translation: lv },
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'lv',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
