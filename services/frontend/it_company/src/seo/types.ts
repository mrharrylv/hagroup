import type { Lang } from '../i18n/locales';

export type JsonLdNode = Readonly<Record<string, unknown>>;

export interface JsonLdDocument {
  '@context': 'https://schema.org';
  '@graph': readonly JsonLdNode[];
}

export interface AlternateLink {
  hreflang: Lang | 'x-default';
  href: string;
}

export interface SeoImage {
  url: string;
  /** Known for the generated share cards; unknown for a project's own image. */
  width?: number;
  height?: number;
  alt: string;
}

export interface Crumb {
  name: string;
  url: string;
}

/** Everything the <head> of one page says about it, in one language. */
export interface PageSeo {
  lang: Lang;
  /** Normalised unprefixed path. */
  path: string;
  /** Absolute URL of this page in this language. */
  url: string;
  title: string;
  description: string;
  /** Absolute canonical URL; null on the not-found page. */
  canonical: string | null;
  /** en, lv, ru and x-default (English); empty on the not-found page. */
  alternates: readonly AlternateLink[];
  robots: string;
  ogType: 'website' | 'article';
  ogLocale: string;
  ogLocaleAlternates: readonly string[];
  siteName: string;
  image: SeoImage;
  jsonLd: JsonLdDocument;
}
