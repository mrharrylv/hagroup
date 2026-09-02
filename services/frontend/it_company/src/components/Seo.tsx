import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCareersData, useProjectsData, useServicesData, type Lang } from '../lib/content';
import { buildSubOrganizations } from '../config/group';

const SITE_URL = 'https://www.hagroup.lv';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const DEFAULT_IMAGE = `${SITE_URL}/brand/ha-group-logo-transparent-512w.png`;

const homeSeo: Record<Lang, { title: string; description: string }> = {
  en: {
    title: 'HA Group | Custom Software, Cloud & DevOps',
    description: 'Latvian IT company delivering custom software, websites, cloud architecture, DevOps automation, AI integration and practical technology consulting.',
  },
  lv: {
    title: 'HA Group | IT uzņēmums: programmatūra, mākonis un DevOps',
    description: 'Latvijas IT uzņēmums, kas izstrādā pielāgotu programmatūru un vietnes, veido mākoņrisinājumus, automatizē DevOps, integrē MI un sniedz tehnoloģiju konsultācijas.',
  },
  ru: {
    title: 'HA Group | Разработка ПО, облака и DevOps',
    description: 'Латвийская IT-компания: разрабатываем программное обеспечение и сайты, проектируем облачную архитектуру, автоматизируем DevOps, интегрируем ИИ и консультируем по технологиям.',
  },
};

const pageSeo: Record<Lang, Record<string, { title: string; description: string }>> = {
  en: {
    '/reviews': { title: 'Client Reviews | HA Group', description: 'Client feedback about HA Group software engineering, cloud, DevOps and technology consulting engagements.' },
    '/contact': { title: 'Contact HA Group | Discuss Your IT Project', description: 'Contact HA Group to discuss custom software, website development, cloud architecture, DevOps, AI integration or IT consulting.' },
    '/about': { title: 'About HA Group | Technology Partner from Latvia', description: 'Meet HA Group, a Latvian technology partner focused on practical, secure and scalable software, cloud and infrastructure solutions.' },
    '/company-details': { title: 'SIA HA Group Company Details', description: 'Official registration, VAT and contact information for SIA HA Group in Latvia.' },
    '/legal/terms': { title: 'Terms and Conditions | HA Group', description: 'Terms and conditions for using the HA Group website and contacting SIA HA Group.' },
    '/legal/privacy': { title: 'Privacy Policy | HA Group', description: 'How SIA HA Group processes personal data submitted through its website and contact forms.' },
    '/legal/cookies': { title: 'Cookie Policy | HA Group', description: 'Information about the necessary browser storage used by the HA Group website.' },
  },
  lv: {
    '/reviews': { title: 'Klientu atsauksmes | HA Group', description: 'Klientu atsauksmes par HA Group programmatūras izstrādes, mākoņa, DevOps un IT konsultāciju projektiem.' },
    '/contact': { title: 'Sazinieties ar HA Group | IT projekta konsultācija', description: 'Sazinieties ar HA Group par programmatūras vai vietnes izstrādi, mākoņarhitektūru, DevOps, MI integrāciju un IT konsultācijām.' },
    '/about': { title: 'Par HA Group | Tehnoloģiju partneris Latvijā', description: 'HA Group ir Latvijas tehnoloģiju partneris praktiskiem, drošiem un mērogojamiem programmatūras, mākoņa un infrastruktūras risinājumiem.' },
    '/company-details': { title: 'SIA HA Group rekvizīti', description: 'SIA HA Group oficiālie reģistrācijas, PVN un saziņas rekvizīti.' },
    '/legal/terms': { title: 'Lietošanas noteikumi | HA Group', description: 'HA Group tīmekļvietnes lietošanas un saziņas noteikumi.' },
    '/legal/privacy': { title: 'Privātuma politika | HA Group', description: 'Kā SIA HA Group apstrādā tīmekļvietnē un saziņas formās iesniegtos personas datus.' },
    '/legal/cookies': { title: 'Sīkdatņu politika | HA Group', description: 'Informācija par nepieciešamo pārlūka krātuvi, ko izmanto HA Group tīmekļvietne.' },
  },
  ru: {
    '/reviews': { title: 'Отзывы клиентов | HA Group', description: 'Отзывы клиентов о проектах HA Group в области разработки ПО, облаков, DevOps и IT-консалтинга.' },
    '/contact': { title: 'Связаться с HA Group | Консультация по IT-проекту', description: 'Обсудите с HA Group разработку ПО или сайта, облачную архитектуру, DevOps, интеграцию ИИ и IT-консалтинг.' },
    '/about': { title: 'О HA Group | Технологический партнёр из Латвии', description: 'HA Group — латвийский технологический партнёр по практичным, безопасным и масштабируемым решениям в области ПО, облаков и инфраструктуры.' },
    '/company-details': { title: 'Реквизиты SIA HA Group', description: 'Официальные регистрационные данные, номер НДС и контакты SIA HA Group.' },
    '/legal/terms': { title: 'Условия использования | HA Group', description: 'Условия использования сайта HA Group и обращения в SIA HA Group.' },
    '/legal/privacy': { title: 'Политика конфиденциальности | HA Group', description: 'Как SIA HA Group обрабатывает персональные данные, отправленные через сайт и контактные формы.' },
    '/legal/cookies': { title: 'Политика использования cookie | HA Group', description: 'Информация о необходимом хранилище браузера, которое использует сайт HA Group.' },
  },
};

const localeByLanguage: Record<Lang, string> = {
  en: 'en_GB',
  lv: 'lv_LV',
  ru: 'ru_RU',
};

const projectLabel: Record<Lang, string> = {
  en: 'project',
  lv: 'projekts',
  ru: 'проект',
};

const balticGPTitle: Record<Lang, string> = {
  en: 'BalticGP motorcycle racing calendar',
  lv: 'BalticGP motošosejas sacensību kalendārs',
  ru: 'Календарь шоссейных мотогонок BalticGP',
};

const careersLabel: Record<Lang, string> = {
  en: 'Careers at HA Group',
  lv: 'Karjera HA Group',
  ru: 'Вакансии HA Group',
};

const breadcrumbLabel: Record<Lang, Record<string, string>> = {
  en: { services: 'Services', projects: 'Projects', legal: 'Legal' },
  lv: { services: 'Pakalpojumi', projects: 'Projekti', legal: 'Juridiskā informācija' },
  ru: { services: 'Услуги', projects: 'Проекты', legal: 'Юридическая информация' },
};

function ensureMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function ensureCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function ensureStructuredData(data: object) {
  let element = document.head.querySelector<HTMLScriptElement>('script[data-seo="structured-data"]');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.seo = 'structured-data';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

export default function Seo() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const servicesData = useServicesData();
  const projects = useProjectsData();
  const careers = useCareersData();
  const language = ((i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2) as Lang);

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    const canonical = `${SITE_URL}${normalizedPath === '/' ? '/' : normalizedPath}`;
    const service = servicesData.items.find((item) => item.path === normalizedPath);
    const projectSlug = normalizedPath.startsWith('/projects/') ? normalizedPath.split('/').pop() : undefined;
    const project = projectSlug ? projects.find((item) => item.slug === projectSlug) : undefined;
    const isLegal = normalizedPath.startsWith('/legal/');

    let seo = homeSeo[language];
    let pageType = 'WebPage';
    let image = DEFAULT_IMAGE;
    let entity: Record<string, unknown> | undefined;

    if (normalizedPath === '/services') {
      seo = { title: `${t('services.title')} | HA Group`, description: t('services.subtitle') };
      pageType = 'CollectionPage';
      entity = {
        '@type': 'ItemList',
        itemListElement: servicesData.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          url: `${SITE_URL}${item.path}`,
        })),
      };
    } else if (service) {
      seo = { title: `${service.title} | HA Group`, description: service.description };
      entity = {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        url: canonical,
        provider: { '@id': ORGANIZATION_ID },
        areaServed: ['Latvia', 'Europe'],
      };
    } else if (normalizedPath === '/projects') {
      seo = { title: `${t('projects.title')} | HA Group`, description: t('projects.subtitle') };
      pageType = 'CollectionPage';
      entity = {
        '@type': 'ItemList',
        itemListElement: projects.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          url: item.caseStudyPath
            ? `${SITE_URL}${item.caseStudyPath}`
            : (item.website.startsWith('http') ? item.website : `${SITE_URL}${item.website}`),
        })),
      };
    } else if (project) {
      seo = { title: `${project.title} | HA Group ${projectLabel[language]}`, description: project.description };
      pageType = 'Article';
      image = project.image ? new URL(project.image, SITE_URL).toString() : DEFAULT_IMAGE;
      entity = {
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        url: canonical,
        dateCreated: project.year ? String(project.year) : undefined,
        creator: { '@id': ORGANIZATION_ID },
        sameAs: project.website.startsWith('http') ? project.website : undefined,
        keywords: project.tags.join(', '),
      };
    } else if (normalizedPath === '/balticgp') {
      seo = { title: `${balticGPTitle[language]} | HA Group`, description: t('balticGP.description') };
      pageType = 'Article';
    } else if (normalizedPath === '/careers') {
      seo = { title: `${careers.title} | ${careersLabel[language]}`, description: careers.subtitle };
    } else if (pageSeo[language][normalizedPath]) {
      seo = pageSeo[language][normalizedPath];
    }

    const robots = window.location.hostname === 'www.hagroup.lv' || window.location.hostname === 'hagroup.lv'
      ? (isLegal ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
      : 'noindex, nofollow';

    document.documentElement.lang = language;
    document.title = seo.title;
    ensureCanonical(canonical);
    ensureMeta('name', 'description', seo.description);
    ensureMeta('name', 'robots', robots);
    ensureMeta('name', 'googlebot', robots);
    ensureMeta('property', 'og:type', pageType === 'Article' ? 'article' : 'website');
    ensureMeta('property', 'og:site_name', 'HA Group');
    ensureMeta('property', 'og:locale', localeByLanguage[language]);
    ensureMeta('property', 'og:title', seo.title);
    ensureMeta('property', 'og:description', seo.description);
    ensureMeta('property', 'og:url', canonical);
    ensureMeta('property', 'og:image', image);
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', seo.title);
    ensureMeta('name', 'twitter:description', seo.description);
    ensureMeta('name', 'twitter:image', image);

    const organization = {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'HA Group',
      legalName: 'SIA HA Group',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
      email: 'info@hagroup.lv',
      telephone: '+37126259293',
      vatID: 'LV40203724866',
      taxID: '40203724866',
      areaServed: ['Latvia', 'Europe'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales and customer support',
        email: 'info@hagroup.lv',
        telephone: '+37126259293',
        availableLanguage: ['English', 'Latvian', 'Russian'],
      },
      // Ties the brand family together for a search engine. Each spoke site
      // declares the matching `parentOrganization` pointing back at this @id,
      // so the relationship is asserted from both ends. This is the documented
      // way to associate a corporate family — and, unlike hidden links, it does
      // not risk a manual action across every property at once.
      subOrganization: buildSubOrganizations(),
    };

    const webPage = {
      '@type': pageType,
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: seo.title,
      description: seo.description,
      inLanguage: language,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORGANIZATION_ID },
    };

    const breadcrumbSegments = normalizedPath.split('/').filter(Boolean);
    const breadcrumb = breadcrumbSegments.length > 0 ? {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'HA Group', item: `${SITE_URL}/` },
        ...breadcrumbSegments.map((segment, index) => ({
          '@type': 'ListItem',
          position: index + 2,
          name: index === breadcrumbSegments.length - 1
            ? seo.title.split(' | ')[0]
            : (breadcrumbLabel[language][segment] ?? segment.replace(/-/g, ' ')),
          item: `${SITE_URL}/${breadcrumbSegments.slice(0, index + 1).join('/')}`,
        })),
      ],
    } : undefined;

    ensureStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'WebSite',
          '@id': WEBSITE_ID,
          url: `${SITE_URL}/`,
          name: 'HA Group',
          publisher: { '@id': ORGANIZATION_ID },
          inLanguage: ['en', 'lv', 'ru'],
        },
        webPage,
        ...(breadcrumb ? [breadcrumb] : []),
        ...(entity ? [entity] : []),
      ],
    });
  }, [careers, i18n.resolvedLanguage, i18n.language, language, pathname, projects, servicesData.items, t]);

  return null;
}
