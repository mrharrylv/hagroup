import type { Lang } from '../i18n/locales';
import social from '../data/social.json';

/**
 * Facts about the site and the company that search engines and assistants
 * are told. Only registered, verifiable facts belong here: the legal name,
 * registration and VAT numbers and the registered office are the ones on the
 * company details page (1_static.json companyDetails).
 */

export const SITE_URL = 'https://www.hagroup.lv';

export const PRODUCTION_HOSTS: readonly string[] = ['www.hagroup.lv', 'hagroup.lv'];

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const NOINDEX_ROBOTS = 'noindex, follow';
/** Anything served from a host other than production: previews, local builds. */
export const OFF_SITE_ROBOTS = 'noindex, nofollow';

export const COMPANY = {
  name: 'HA Group',
  legalName: 'SIA HA Group',
  alternateNames: ['HAGroup', 'hagroup.lv'],
  websiteAlternateNames: ['SIA HA Group', 'hagroup.lv'],
  registrationNumber: '40203724866',
  vatId: 'LV40203724866',
  email: social.email,
  telephone: social.phone,
  address: {
    streetAddress: 'Valdeķu iela 1',
    addressLocality: 'Rīga',
    postalCode: 'LV-1058',
    addressCountry: 'LV',
    countryName: 'Latvia',
  },
  languageNames: ['English', 'Latvian', 'Russian'],
} as const;

export const LOGO = { url: `${SITE_URL}/logo-512.png`, width: 512, height: 512 } as const;

/** 1200x630 share cards, one per language (scripts/generate-images.mjs). */
export const OG_IMAGE_PATH: Record<Lang, string> = {
  en: '/og-image.png',
  lv: '/og-image-lv.png',
  ru: '/og-image-ru.png',
};
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const OG_LOCALE: Record<Lang, string> = {
  en: 'en_GB',
  lv: 'lv_LV',
  ru: 'ru_RU',
};

export function isProductionHost(hostname: string): boolean {
  return PRODUCTION_HOSTS.includes(hostname);
}

/** Absolute URL on the canonical host for a site path. */
export function absoluteUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}
