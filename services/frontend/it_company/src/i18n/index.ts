import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enStatic from './locales/en/1_static.json';
import lvStatic from './locales/lv/1_static.json';
import ruStatic from './locales/ru/1_static.json';

const savedLang = localStorage.getItem('cloudie-lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enStatic },
    lv: { translation: lvStatic },
    ru: { translation: ruStatic },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
