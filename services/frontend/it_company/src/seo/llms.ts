import { localizePath } from '../i18n/locales';
import type { Project, ServicePageCopy } from '../lib/contentTypes';
import { faqEntries } from '../lib/faq';
import { seoContentFor, type SeoContent } from './content';
import { SERVICE_ROUTES, sitemapPaths } from './routes';
import { COMPANY, SITE_URL, absoluteUrl } from './site';
import { summarize } from './text';

/**
 * llms.txt (https://llmstxt.org) and llms-full.txt: a plain map of the site
 * for language models, in English. The wording is built from the same locale
 * copy and company facts as the pages, so it cannot claim anything the site
 * does not.
 */

const COMPANY_PATHS = ['/about', '/contact', '/company-details', '/careers'] as const;
const LEGAL_PATHS = ['/legal/terms', '/legal/privacy', '/legal/cookies'] as const;
const LINE_SUMMARY_MAX = 200;

/**
 * The blockquote summary. The home description is written as a sentence for
 * search results; when it already names the company it stands on its own,
 * otherwise the company is introduced first so the line still says who.
 */
function summaryLine(content: SeoContent): string {
  const description = content.seo.pages['/'].description;
  return description.includes(COMPANY.name)
    ? `> ${description}`
    : `> ${COMPANY.name} (${COMPANY.legalName}): ${description}`;
}

function factsParagraph(): string {
  const { address } = COMPANY;
  return [
    `${COMPANY.legalName} is registered in Latvia under registration number ${COMPANY.registrationNumber}`,
    `(VAT ${COMPANY.vatId}), with its registered office at ${address.streetAddress}, ${address.addressLocality},`,
    `${address.postalCode}, ${address.countryName}. The website is published in English, Latvian and Russian.`,
    `Contact: ${COMPANY.email}, ${COMPANY.telephone}.`,
  ].join(' ');
}

function linkLine(title: string, url: string, description: string): string {
  return `- [${title}](${url}): ${description}`;
}

function pageLink(content: SeoContent, path: string): string {
  const copy = content.seo.pages[path];
  return linkLine(copy.title, absoluteUrl(localizePath(path, content.lang)), copy.description);
}

function projectCasePath(project: Project): string | undefined {
  if (project.caseStudyPath) return project.caseStudyPath;
  return project.website.startsWith('/') ? project.website : undefined;
}

function serviceLines(content: SeoContent): string[] {
  const devops = SERVICE_ROUTES.find((route) => route.key === 'devops')?.path ?? '/services';
  return [
    '## Services',
    '',
    ...content.services.items.map((item) =>
      linkLine(item.title, absoluteUrl(item.path), content.seo.pages[item.path]?.description ?? item.description),
    ),
    '',
    `Every page also exists in Latvian under ${SITE_URL}/lv and in Russian under ${SITE_URL}/ru, with the same paths (for example ${absoluteUrl(localizePath(devops, 'lv'))}).`,
  ];
}

function caseStudyLines(content: SeoContent): string[] {
  const indexable = new Set(sitemapPaths(content));
  const lines = content.projects.flatMap((project) => {
    const path = projectCasePath(project);
    if (!path || !indexable.has(path)) return [];
    const summary = project.seoDescription ?? summarize(project.description, LINE_SUMMARY_MAX, 70);
    return [linkLine(project.title, absoluteUrl(path), summary)];
  });
  return ['## Case studies', '', ...lines];
}

function optionalLines(content: SeoContent, translations: readonly SeoContent[]): string[] {
  return [
    '## Optional',
    '',
    ...LEGAL_PATHS.map((path) => pageLink(content, path)),
    ...translations.map((translation) => pageLink(translation, '/')),
  ];
}

/** llms.txt: H1, a one-sentence summary, the facts, then link lists. */
export function buildLlmsTxt(
  content: SeoContent,
  translations: readonly SeoContent[] = [seoContentFor('lv'), seoContentFor('ru')],
): string {
  return [
    `# ${COMPANY.name}`,
    '',
    summaryLine(content),
    '',
    factsParagraph(),
    '',
    ...serviceLines(content),
    '',
    ...caseStudyLines(content),
    '',
    '## Company',
    '',
    ...COMPANY_PATHS.map((path) => pageLink(content, path)),
    '',
    ...optionalLines(content, translations),
    '',
  ].join('\n');
}

function servicePageSection(page: ServicePageCopy, url: string): string[] {
  const faq = faqEntries(page);
  return [
    `## ${page.title}`,
    '',
    `URL: ${url}`,
    '',
    page.subtitle,
    '',
    `### ${page.overviewTitle}`,
    '',
    page.overviewText,
    '',
    `### ${page.featuresTitle}`,
    '',
    ...page.features.map((feature) => `- ${feature.title}: ${feature.description}`),
    '',
    `### ${page.processTitle}`,
    '',
    ...page.process.map((step, index) => `${index + 1}. ${step.title}: ${step.description}`),
    '',
    `### ${page.techTitle}`,
    '',
    page.technologies.map((tech) => tech.name).join(', '),
    ...(faq.length > 0
      ? ['', '### FAQ', '', ...faq.flatMap((entry) => [`Q: ${entry.question}`, `A: ${entry.answer}`, ''])]
      : ['']),
  ];
}

/** llms-full.txt: the full English text of every service page. */
export function buildLlmsFullTxt(content: SeoContent): string {
  const sections = SERVICE_ROUTES.flatMap((route) => {
    const page = content.services.pages[route.key];
    return page ? servicePageSection(page, absoluteUrl(route.path)) : [];
  });
  return [`# ${COMPANY.name}: services in full`, '', summaryLine(content), '', factsParagraph(), '', ...sections].join('\n');
}
