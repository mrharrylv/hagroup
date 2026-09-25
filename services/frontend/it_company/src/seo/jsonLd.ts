import { LOCALES, localizePath, type Lang } from '../i18n/locales';
import { faqEntries } from '../lib/faq';
import type { Project } from '../lib/contentTypes';
import type { SeoContent } from './content';
import type { ResolvedRoute, RouteKind } from './routes';
import {
  COMPANY,
  LOGO,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  ORGANIZATION_ID,
  SITE_URL,
  WEBSITE_ID,
  absoluteUrl,
} from './site';
import type { Crumb, JsonLdDocument, JsonLdNode, SeoImage } from './types';

/**
 * The schema.org @graph for one page. Every node describes something the
 * visitor can see on that page, or the organisation and site it belongs to.
 */

export interface GraphInput {
  content: SeoContent;
  route: ResolvedRoute;
  canonical: string | null;
  title: string;
  description: string;
  image: SeoImage;
  crumbs: readonly Crumb[];
}

const ORG_REF = { '@id': ORGANIZATION_ID } as const;
const WEBSITE_REF = { '@id': WEBSITE_ID } as const;

const AREA_SERVED: readonly JsonLdNode[] = [
  { '@type': 'Country', name: COMPANY.address.countryName },
  { '@type': 'Continent', name: 'Europe' },
];

const PAGE_TYPES: Partial<Record<RouteKind, string>> = {
  services: 'CollectionPage',
  projects: 'CollectionPage',
  about: 'AboutPage',
  contact: 'ContactPage',
};

function imageObject(image: SeoImage): JsonLdNode {
  return {
    '@type': 'ImageObject',
    url: image.url,
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
  };
}

function localUrl(path: string, lang: Lang): string {
  return absoluteUrl(localizePath(path, lang));
}

function knowsAbout(content: SeoContent): string[] {
  const services = content.services.items.map((item) => item.title);
  const technologies = Object.values(content.services.pages).flatMap((page) =>
    page.technologies.map((tech) => tech.name),
  );
  return [...new Set([...services, ...technologies])];
}

function offerCatalog(content: SeoContent): JsonLdNode {
  return {
    '@type': 'OfferCatalog',
    name: content.seo.breadcrumbs.services,
    itemListElement: content.services.items.map((item) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: item.title,
        description: item.description,
        url: localUrl(item.path, content.lang),
      },
    })),
  };
}

function organizationNode({ content, route }: GraphInput): JsonLdNode {
  const card = { url: absoluteUrl(OG_IMAGE_PATH[content.lang]), ...OG_IMAGE_SIZE, alt: content.seo.ogImageAlt };
  const withCatalog = route.kind === 'home' || route.kind === 'services';
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    alternateName: [...COMPANY.alternateNames],
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: LOGO.url, width: LOGO.width, height: LOGO.height },
    image: imageObject(card),
    description: content.seo.pages['/'].description,
    email: COMPANY.email,
    telephone: COMPANY.telephone,
    vatID: COMPANY.vatId,
    taxID: COMPANY.registrationNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.streetAddress,
      addressLocality: COMPANY.address.addressLocality,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.addressCountry,
    },
    areaServed: AREA_SERVED,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: COMPANY.email,
        telephone: COMPANY.telephone,
        availableLanguage: [...COMPANY.languageNames],
      },
    ],
    knowsAbout: knowsAbout(content),
    ...(content.profiles.length > 0 ? { sameAs: [...content.profiles] } : {}),
    ...(withCatalog ? { hasOfferCatalog: offerCatalog(content) } : {}),
  };
}

function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: COMPANY.name,
    alternateName: [...COMPANY.websiteAlternateNames],
    inLanguage: [...LOCALES],
    publisher: ORG_REF,
  };
}

function webPageNode(input: GraphInput, canonical: string, mainEntityId: string | undefined): JsonLdNode {
  return {
    '@type': PAGE_TYPES[input.route.kind] ?? 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: input.title,
    description: input.description,
    inLanguage: input.content.lang,
    isPartOf: WEBSITE_REF,
    about: ORG_REF,
    primaryImageOfPage: imageObject(input.image),
    ...(input.crumbs.length > 1 ? { breadcrumb: { '@id': `${canonical}#breadcrumb` } } : {}),
    ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {}),
  };
}

function breadcrumbNodes(crumbs: readonly Crumb[], canonical: string): JsonLdNode[] {
  if (crumbs.length < 2) return [];
  return [
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    },
  ];
}

function itemListNode(canonical: string, entries: readonly { name: string; url: string }[]): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': `${canonical}#list`,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      url: entry.url,
    })),
  };
}

function projectUrl(project: Project, lang: Lang): string {
  if (project.caseStudyPath) return localUrl(project.caseStudyPath, lang);
  if (project.website.startsWith('/')) return localUrl(project.website, lang);
  return project.website;
}

function serviceNodes({ content, route }: GraphInput, canonical: string): JsonLdNode[] {
  const page = route.serviceKey ? content.services.pages[route.serviceKey] : undefined;
  if (!page) return [];
  const item = content.services.items.find((candidate) => candidate.path === route.canonicalPath);
  const service: JsonLdNode = {
    '@type': 'Service',
    '@id': `${canonical}#service`,
    name: page.title,
    serviceType: item?.title ?? page.title,
    description: page.subtitle,
    url: canonical,
    provider: ORG_REF,
    areaServed: AREA_SERVED,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: canonical,
      availableLanguage: [...COMPANY.languageNames],
    },
  };
  const faq = faqEntries(page);
  if (faq.length === 0) return [service];
  const faqPage: JsonLdNode = {
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    url: canonical,
    inLanguage: content.lang,
    isPartOf: WEBSITE_REF,
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
  return [service, faqPage];
}

function creativeWorkNode(project: Project, lang: Lang, canonical: string): JsonLdNode {
  const external = project.website.startsWith('http') ? project.website : undefined;
  return {
    '@type': 'CreativeWork',
    '@id': `${canonical}#work`,
    name: project.title,
    description: project.description,
    url: canonical,
    inLanguage: lang,
    creator: ORG_REF,
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.tags.length > 0 ? { keywords: project.tags.join(', ') } : {}),
    ...(external ? { sameAs: external } : {}),
  };
}

/** Nodes for what the page is about; the first is the page's main entity. */
function entityNodes(input: GraphInput, canonical: string): JsonLdNode[] {
  const { content, route } = input;
  switch (route.kind) {
    case 'service':
      return serviceNodes(input, canonical);
    case 'project':
      return route.project ? [creativeWorkNode(route.project, content.lang, canonical)] : [];
    case 'services':
      return [itemListNode(canonical, content.services.items.map((item) => ({
        name: item.title,
        url: localUrl(item.path, content.lang),
      })))];
    case 'projects':
      return [itemListNode(canonical, content.projects.map((project) => ({
        name: project.title,
        url: projectUrl(project, content.lang),
      })))];
    default:
      return [];
  }
}

export function buildGraph(input: GraphInput): JsonLdDocument {
  const base = [organizationNode(input), websiteNode()];
  const { canonical } = input;
  if (!canonical || input.route.kind === 'notFound') {
    return { '@context': 'https://schema.org', '@graph': base };
  }
  const entities = entityNodes(input, canonical);
  const mainEntityId = entities.length > 0 ? String(entities[0]['@id']) : undefined;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...base,
      webPageNode(input, canonical, mainEntityId),
      ...breadcrumbNodes(input.crumbs, canonical),
      ...entities,
    ],
  };
}
