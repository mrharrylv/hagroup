/**
 * Shapes of the locale JSON under src/i18n/locales/<lang>/, with the language
 * already resolved. Shared by the React components, the SEO module and the
 * build-time prerender, so all three read the same fields the same way.
 */

/** A review entry (7_reviews.json). */
export interface Review {
  id: string;
  name: string;
  title: string;
  company: string;
  description: string;
  rating: number;
  date: string;
  image: string;
  projectId: string | null;
  featured: boolean;
}

/** A project entry (5_projects.json). */
export interface Project {
  id: string;
  title: string;
  description: string;
  /**
   * Hand-written search and share copy (120 to 160 characters) for a case
   * study whose description is too long to summarise in whole sentences.
   */
  seoDescription?: string;
  image: string;
  website: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  caseStudyPath?: string;
  slug: string;
  tags: string[];
  year?: number;
  featured: boolean;
  client: string;
  role: string;
  duration: string;
  technologies: string[];
  highlights: string[];
}

/** A service card (8_services.json items[]). */
export interface ServiceItem {
  key: string;
  path: string;
  icon: string;
  title: string;
  description: string;
}

/** One question and its answer, shown on a service page and marked up as FAQPage. */
export interface FaqEntry {
  question: string;
  answer: string;
}

/** A service page (8_services.json pages[key]). `faq` is optional. */
export interface ServicePageCopy {
  icon: string;
  title: string;
  subtitle: string;
  overviewTitle: string;
  overviewText: string;
  featuresTitle: string;
  features: { icon: string; title: string; description: string }[];
  processTitle: string;
  process: { step: string; title: string; description: string }[];
  techTitle: string;
  technologies: { name: string; icon: string }[];
  ctaTitle: string;
  ctaText: string;
  /** Heading of the FAQ section; falls back to 1_static servicePages.faqTitle. */
  faqTitle?: string;
  faq?: unknown;
}

/** 8_services.json */
export interface ServicesCopy {
  items: ServiceItem[];
  pages: Record<string, ServicePageCopy>;
}

/** Title and meta description of one route (6_seo.json pages[path]). */
export interface SeoPageCopy {
  title: string;
  description: string;
}

/** 6_seo.json */
export interface SeoCopy {
  siteName: string;
  ogImageAlt: string;
  projectTitleSuffix: string;
  breadcrumbs: {
    home: string;
    services: string;
    projects: string;
    legal: string;
  };
  /**
   * A page's name as the page shows it (its nav or footer label, or its h1),
   * by unprefixed path: the last breadcrumb and its llms.txt link label.
   */
  names: Record<string, string>;
  pages: Record<string, SeoPageCopy>;
}
