import { describe, expect, it } from 'vitest';
import { LOCALES, type Lang } from '../i18n/locales';
import { buildSeo, type PageSeo } from './buildSeo';
import { seoContentFor } from './content';
import { NOT_FOUND_PATH, prerenderPaths } from './routes';
import { INDEX_ROBOTS, NOINDEX_ROBOTS, SITE_URL } from './site';

type GraphNode = Record<string, unknown>;

const PATHS = prerenderPaths(seoContentFor('en').projects);

function seoFor(path: string, lang: Lang): PageSeo {
  return buildSeo({ path, lang, content: seoContentFor(lang) });
}

function graph(seo: PageSeo): GraphNode[] {
  return seo.jsonLd['@graph'] as GraphNode[];
}

function nodeOfType(seo: PageSeo, type: string): GraphNode | undefined {
  return graph(seo).find((node) => node['@type'] === type);
}

function containsUndefined(value: unknown): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.some(containsUndefined);
  if (value && typeof value === 'object') return Object.values(value).some(containsUndefined);
  return false;
}

describe.each(LOCALES)('every page in %s', (lang) => {
  const pages = PATHS.map((path) => seoFor(path, lang));

  it('has a unique title of at most 70 characters', () => {
    const titles = pages.map((seo) => seo.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const seo of pages) expect(seo.title.length, `${seo.path}: ${seo.title}`).toBeLessThanOrEqual(70);
  });

  it('has a unique description of 70 to 170 characters', () => {
    const descriptions = pages.map((seo) => seo.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const seo of pages) {
      expect(seo.description.length, `${seo.path}: ${seo.description}`).toBeGreaterThanOrEqual(70);
      expect(seo.description.length, `${seo.path}: ${seo.description}`).toBeLessThanOrEqual(170);
    }
  });

  it('is canonical to its own absolute URL', () => {
    for (const seo of pages) {
      expect(seo.canonical).toBe(seo.url);
      expect(seo.url.startsWith(`${SITE_URL}/`)).toBe(true);
    }
  });

  it('lists reciprocal alternates for all three languages plus x-default', () => {
    for (const seo of pages) {
      expect(seo.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'lv', 'ru', 'x-default']);
      const self = seo.alternates.find((alt) => alt.hreflang === lang);
      expect(self?.href).toBe(seo.canonical);
      const xDefault = seo.alternates.find((alt) => alt.hreflang === 'x-default');
      expect(xDefault?.href).toBe(seo.alternates[0].href);
      for (const alt of seo.alternates.filter((a) => a.hreflang !== 'x-default')) {
        const other = seoFor(seo.path, alt.hreflang as Lang);
        expect(other.canonical).toBe(alt.href);
        expect(other.alternates).toEqual(seo.alternates);
      }
    }
  });

  it('has JSON-LD that survives a JSON round trip and contains no undefined', () => {
    for (const seo of pages) {
      expect(containsUndefined(seo.jsonLd), seo.path).toBe(false);
      expect(JSON.parse(JSON.stringify(seo.jsonLd))).toEqual(seo.jsonLd);
    }
  });

  it('uses absolute URLs for the logo and the share image', () => {
    for (const seo of pages) {
      expect(seo.image.url.startsWith(`${SITE_URL}/`)).toBe(true);
      const org = nodeOfType(seo, 'Organization') as GraphNode;
      expect((org.logo as GraphNode).url).toBe(`${SITE_URL}/logo-512.png`);
      expect(String((org.image as GraphNode).url).startsWith(`${SITE_URL}/`)).toBe(true);
    }
  });

  it('declares the page language', () => {
    for (const seo of pages) {
      expect(seo.lang).toBe(lang);
      const webPage = graph(seo).find((node) => String(node['@id']).endsWith('#webpage'));
      expect(webPage?.inLanguage).toBe(lang);
    }
  });
});

describe('robots', () => {
  it('lets search engines index and show large previews of normal pages', () => {
    expect(seoFor('/services/devops', 'en').robots).toBe(INDEX_ROBOTS);
    expect(INDEX_ROBOTS).toBe('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  });

  it('keeps legal pages and the 404 page out of the index', () => {
    expect(seoFor('/legal/terms', 'lv').robots).toBe(NOINDEX_ROBOTS);
    expect(seoFor(NOT_FOUND_PATH, 'en').robots).toBe(NOINDEX_ROBOTS);
    expect(NOINDEX_ROBOTS).toBe('noindex, follow');
  });
});

describe('URLs', () => {
  it('puts Latvian and Russian under their prefix', () => {
    expect(seoFor('/', 'en').canonical).toBe(`${SITE_URL}/`);
    expect(seoFor('/', 'lv').canonical).toBe(`${SITE_URL}/lv`);
    expect(seoFor('/services/devops', 'ru').canonical).toBe(`${SITE_URL}/ru/services/devops`);
  });

  it('sends /projects/balticgp to /balticgp', () => {
    const seo = seoFor('/projects/balticgp', 'lv');
    expect(seo.canonical).toBe(`${SITE_URL}/lv/balticgp`);
  });

  it('takes the path as the router gives it and does not strip a language prefix again', () => {
    // /lv/lv/services: the /lv router sees /lv/services, matches no route and
    // renders the not-found page, so the head must say not found as well.
    const doubled: [string, Lang][] = [['/lv/services', 'lv'], ['/ru/services', 'lv'], ['/lv/services', 'ru'], ['/ru', 'ru']];
    for (const [path, lang] of doubled) {
      const seo = seoFor(path, lang);
      expect(seo.canonical, `${path} (${lang})`).toBeNull();
      expect(seo.robots, `${path} (${lang})`).toBe(NOINDEX_ROBOTS);
      expect(seo.title, `${path} (${lang})`).toBe(seoContentFor(lang).seo.pages[NOT_FOUND_PATH].title);
    }
    expect(seoFor('/services', 'lv').canonical).toBe(`${SITE_URL}/lv/services`);
    expect(seoFor('/', 'ru').canonical).toBe(`${SITE_URL}/ru`);
  });

  it('describes a doubled slash as the not-found page the router shows for it', () => {
    // /lv//services: the /lv router sees //services and renders not found.
    for (const [path, lang] of [['//services', 'lv'], ['//about', 'ru'], ['//services/devops', 'lv'], ['//services', 'en']] as [string, Lang][]) {
      const seo = seoFor(path, lang);
      expect(seo.canonical, `${path} (${lang})`).toBeNull();
      expect(seo.robots, `${path} (${lang})`).toBe(NOINDEX_ROBOTS);
      expect(seo.title, `${path} (${lang})`).toBe(seoContentFor(lang).seo.pages[NOT_FOUND_PATH].title);
    }
  });

  it('gives the 404 page no canonical and no alternates', () => {
    const seo = seoFor('/definitely-missing', 'en');
    expect(seo.canonical).toBeNull();
    expect(seo.alternates).toEqual([]);
    expect(seo.title).toBe(seoContentFor('en').seo.pages[NOT_FOUND_PATH].title);
  });
});

describe('share card', () => {
  it('uses the card made for each language at 1200x630', () => {
    expect(seoFor('/', 'en').image).toMatchObject({ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 });
    expect(seoFor('/', 'lv').image.url).toBe(`${SITE_URL}/og-image-lv.png`);
    expect(seoFor('/', 'ru').image.url).toBe(`${SITE_URL}/og-image-ru.png`);
    expect(seoFor('/', 'lv').image.alt).toBe(seoContentFor('lv').seo.ogImageAlt);
  });

  it('does not use a project SVG, which social crawlers cannot render', () => {
    expect(seoFor('/projects/iepako', 'en').image.url).toBe(`${SITE_URL}/og-image.png`);
  });

  it('does not use an image hosted on another site', () => {
    expect(seoFor('/projects/rokber', 'en').image.url).toBe(`${SITE_URL}/og-image.png`);
  });

  it('names the locale and its alternates for Open Graph', () => {
    const seo = seoFor('/', 'lv');
    expect(seo.ogLocale).toBe('lv_LV');
    expect(seo.ogLocaleAlternates).toEqual(['en_GB', 'ru_RU']);
  });
});

describe('JSON-LD graph', () => {
  it('describes the organisation with its registered facts', () => {
    const org = nodeOfType(seoFor('/', 'en'), 'Organization') as GraphNode;
    expect(org['@id']).toBe(`${SITE_URL}/#organization`);
    expect(org.legalName).toBe('SIA HA Group');
    expect(org.vatID).toBe('LV40203724866');
    expect(org.taxID).toBe('40203724866');
    expect(org.email).toBe('info@hagroup.lv');
    expect(org.telephone).toBe('+37126259293');
    expect(org.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Valdeķu iela 1',
      addressLocality: 'Rīga',
      postalCode: 'LV-1058',
      addressCountry: 'LV',
    });
    expect(org.description).toBe(seoContentFor('en').seo.pages['/'].description);
    expect(org.logo).toEqual({ '@type': 'ImageObject', url: `${SITE_URL}/logo-512.png`, width: 512, height: 512 });
  });

  it('derives knowsAbout from the services and the technologies on their pages', () => {
    const org = nodeOfType(seoFor('/', 'en'), 'Organization') as GraphNode;
    const knowsAbout = org.knowsAbout as string[];
    expect(knowsAbout).toContain('DevOps & CI/CD');
    expect(knowsAbout).toContain('Terraform');
    expect(new Set(knowsAbout).size).toBe(knowsAbout.length);
  });

  it('adds sameAs only when profiles are listed', () => {
    const org = nodeOfType(seoFor('/', 'en'), 'Organization') as GraphNode;
    expect(org.sameAs).toBeUndefined();
    const withProfiles = buildSeo({
      path: '/',
      lang: 'en',
      content: { ...seoContentFor('en'), profiles: ['https://www.linkedin.com/company/example'] },
    });
    const orgWith = nodeOfType(withProfiles, 'Organization') as GraphNode;
    expect(orgWith.sameAs).toEqual(['https://www.linkedin.com/company/example']);
  });

  it('describes the website once', () => {
    const site = nodeOfType(seoFor('/', 'ru'), 'WebSite') as GraphNode;
    expect(site['@id']).toBe(`${SITE_URL}/#website`);
    expect(site.name).toBe('HA Group');
    expect(site.alternateName).toEqual(['SIA HA Group', 'hagroup.lv']);
  });

  it('lists the eight services as an offer catalog on home and /services only', () => {
    for (const path of ['/', '/services']) {
      const org = nodeOfType(seoFor(path, 'en'), 'Organization') as GraphNode;
      const catalog = org.hasOfferCatalog as GraphNode;
      expect(catalog['@type']).toBe('OfferCatalog');
      expect((catalog.itemListElement as unknown[]).length).toBe(8);
    }
    const orgOnContact = nodeOfType(seoFor('/contact', 'en'), 'Organization') as GraphNode;
    expect(orgOnContact.hasOfferCatalog).toBeUndefined();
  });

  it('types listing, about and contact pages', () => {
    expect(nodeOfType(seoFor('/services', 'en'), 'CollectionPage')).toBeDefined();
    expect(nodeOfType(seoFor('/projects', 'en'), 'CollectionPage')).toBeDefined();
    expect(nodeOfType(seoFor('/about', 'en'), 'AboutPage')).toBeDefined();
    expect(nodeOfType(seoFor('/contact', 'en'), 'ContactPage')).toBeDefined();
  });

  it('describes a service page as a Service provided by the organisation', () => {
    const seo = seoFor('/services/devops', 'lv');
    const service = nodeOfType(seo, 'Service') as GraphNode;
    const page = seoContentFor('lv').services.pages.devops;
    expect(service.name).toBe(page.title);
    expect(service.description).toBe(page.subtitle);
    expect(service.url).toBe(seo.canonical);
    expect(service.provider).toEqual({ '@id': `${SITE_URL}/#organization` });
    expect(service.serviceType).toBeTruthy();
  });

  it('adds a FAQPage built from exactly the questions on the page', () => {
    const content = seoContentFor('en');
    const faq = [
      { question: 'Do you work with Kubernetes?', answer: 'Yes, we run it in production.' },
      { question: 'Can you take over an existing pipeline?', answer: 'Yes, after a review.' },
    ];
    const withFaq = {
      ...content,
      services: {
        ...content.services,
        pages: { ...content.services.pages, devops: { ...content.services.pages.devops, faq } },
      },
    };
    const seo = buildSeo({ path: '/services/devops', lang: 'en', content: withFaq });
    const faqPage = nodeOfType(seo, 'FAQPage') as GraphNode;
    expect(faqPage.mainEntity).toEqual(
      faq.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      })),
    );
  });

  it('adds no FAQPage when the service page has no questions', () => {
    const content = seoContentFor('en');
    const { faq: _unused, ...devopsWithoutFaq } = content.services.pages.devops;
    void _unused;
    const withoutFaq = {
      ...content,
      services: { ...content.services, pages: { ...content.services.pages, devops: devopsWithoutFaq } },
    };
    const seo = buildSeo({ path: '/services/devops', lang: 'en', content: withoutFaq });
    expect(nodeOfType(seo, 'FAQPage')).toBeUndefined();
  });

  it('describes a case study as a CreativeWork by the organisation', () => {
    const seo = seoFor('/projects/harent', 'en');
    const work = nodeOfType(seo, 'CreativeWork') as GraphNode;
    expect(work.name).toBe(seoContentFor('en').projects.find((p) => p.slug === 'harent')?.title);
    expect(work.creator).toEqual({ '@id': `${SITE_URL}/#organization` });
    expect(seo.ogType).toBe('article');
    expect(seo.title).toBe(`${work.name} | ${seoContentFor('en').seo.projectTitleSuffix}`);
  });

  it('describes a case study with its hand-written seoDescription when it has one', () => {
    const content = seoContentFor('lv');
    const seoDescription = 'A hand-written summary of the Rokber case study, short enough for a search result and a share card, in whole words.';
    const projects = content.projects.map((project) => (project.slug === 'rokber' ? { ...project, seoDescription } : project));
    const seo = buildSeo({ path: '/projects/rokber', lang: 'lv', content: { ...content, projects } });
    const page = graph(seo).find((node) => node['@id'] === `${seo.canonical}#webpage`) as GraphNode;
    expect(seo.description).toBe(seoDescription);
    expect(page.description).toBe(seoDescription);
  });

  it('summarises the description of a case study without a seoDescription', () => {
    const project = seoContentFor('en').projects.find((p) => p.slug === 'rokber');
    expect(project?.seoDescription).toBeUndefined();
    expect(project?.description.startsWith(seoFor('/projects/rokber', 'en').description)).toBe(true);
  });

  it('builds localized breadcrumbs with locale-prefixed URLs', () => {
    const seo = seoFor('/services/devops', 'lv');
    const crumbs = nodeOfType(seo, 'BreadcrumbList') as GraphNode;
    const items = crumbs.itemListElement as GraphNode[];
    const copy = seoContentFor('lv');
    expect(items.map((item) => item.name)).toEqual([
      copy.seo.breadcrumbs.home,
      copy.seo.breadcrumbs.services,
      copy.services.pages.devops.title,
    ]);
    expect(items.map((item) => item.item)).toEqual([
      `${SITE_URL}/lv`,
      `${SITE_URL}/lv/services`,
      `${SITE_URL}/lv/services/devops`,
    ]);
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  it.each([
    ['/about', 'en', ['HA Group', 'About Us']],
    ['/legal/terms', 'en', ['HA Group', 'Terms & Conditions']],
    ['/reviews', 'en', ['HA Group', 'Client Testimonials']],
    ['/company-details', 'lv', ['HA Group', 'Uzņēmuma rekvizīti']],
    ['/careers', 'ru', ['HA Group', 'Карьера']],
    ['/projects/rokber', 'en', ['HA Group', 'Our Work', 'Rokber.lv']],
    ['/projects', 'ru', ['HA Group', 'Наши проекты']],
  ] as [string, Lang, string[]][])('names the breadcrumbs of %s (%s) as the page shows them', (path, lang, names) => {
    const crumbs = nodeOfType(seoFor(path, lang), 'BreadcrumbList') as GraphNode;
    expect((crumbs.itemListElement as GraphNode[]).map((item) => item.name)).toEqual(names);
  });

  it('has no breadcrumb on the home page', () => {
    expect(nodeOfType(seoFor('/', 'en'), 'BreadcrumbList')).toBeUndefined();
  });

  it('points every WebPage at the site, the organisation and its share card', () => {
    const seo = seoFor('/about', 'en');
    const page = graph(seo).find((node) => node['@id'] === `${seo.canonical}#webpage`) as GraphNode;
    expect(page.isPartOf).toEqual({ '@id': `${SITE_URL}/#website` });
    expect(page.about).toEqual({ '@id': `${SITE_URL}/#organization` });
    expect((page.primaryImageOfPage as GraphNode).url).toBe(seo.image.url);
  });
});
