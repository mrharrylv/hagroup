import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Lang } from './locales';

import enStatic from './locales/en/1_static.json';
import lvStatic from './locales/lv/1_static.json';
import ruStatic from './locales/ru/1_static.json';

const RESOURCES = {
  en: { translation: enStatic },
  lv: { translation: lvStatic },
  ru: { translation: ruStatic },
};

/**
 * A ready i18next instance for one language.
 *
 * The language comes from the URL (see ./locales), never from storage, so
 * the build can render /lv/... in Latvian and the browser starts in the same
 * language the HTML was rendered in. Resources are bundled JSON, so with
 * `initAsync: false` the instance is initialised before this returns. The
 * prerender makes one per page; the browser makes one at boot.
 */
export function createI18n(lang: Lang): I18n {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    resources: RESOURCES,
    lng: lang,
    fallbackLng: 'en',
    initAsync: false,
    showSupportNotice: false,
    interpolation: {
      escapeValue: false,
    },
  }).catch((error: unknown) => {
    console.error('[i18n] Failed to initialise translations:', error);
  });
  return instance;
}
