import type { Lang } from '../i18n/locales';
import type { Project, SeoCopy, ServicesCopy } from '../lib/contentTypes';
import social from '../data/social.json';

import enSeo from '../i18n/locales/en/6_seo.json';
import lvSeo from '../i18n/locales/lv/6_seo.json';
import ruSeo from '../i18n/locales/ru/6_seo.json';

import enServices from '../i18n/locales/en/8_services.json';
import lvServices from '../i18n/locales/lv/8_services.json';
import ruServices from '../i18n/locales/ru/8_services.json';

import enProjects from '../i18n/locales/en/5_projects.json';
import lvProjects from '../i18n/locales/lv/5_projects.json';
import ruProjects from '../i18n/locales/ru/5_projects.json';

import enReviews from '../i18n/locales/en/7_reviews.json';
import lvReviews from '../i18n/locales/lv/7_reviews.json';
import ruReviews from '../i18n/locales/ru/7_reviews.json';

/** Everything the SEO module reads for one language. Plain data, no hooks. */
export interface SeoContent {
  lang: Lang;
  seo: SeoCopy;
  services: ServicesCopy;
  projects: readonly Project[];
  /** Reviews on /reviews; the page stays out of the index while it has none. */
  reviewCount: number;
  /** Official profile URLs for Organization.sameAs (src/data/social.json). */
  profiles: readonly string[];
}

const SEO: Record<Lang, SeoCopy> = { en: enSeo, lv: lvSeo, ru: ruSeo };
const SERVICES: Record<Lang, ServicesCopy> = {
  en: enServices as ServicesCopy,
  lv: lvServices as ServicesCopy,
  ru: ruServices as ServicesCopy,
};
const PROJECTS: Record<Lang, readonly Project[]> = {
  en: enProjects as Project[],
  lv: lvProjects as Project[],
  ru: ruProjects as Project[],
};
const REVIEW_COUNT: Record<Lang, number> = {
  en: enReviews.length,
  lv: lvReviews.length,
  ru: ruReviews.length,
};

/** Only absolute https URLs are passed on as profiles. */
function officialProfiles(): readonly string[] {
  const listed: unknown = (social as { profiles?: unknown }).profiles;
  if (!Array.isArray(listed)) return [];
  return listed.filter((url): url is string => typeof url === 'string' && url.startsWith('https://'));
}

export function seoContentFor(lang: Lang): SeoContent {
  return {
    lang,
    seo: SEO[lang],
    services: SERVICES[lang],
    projects: PROJECTS[lang],
    reviewCount: REVIEW_COUNT[lang],
    profiles: officialProfiles(),
  };
}
