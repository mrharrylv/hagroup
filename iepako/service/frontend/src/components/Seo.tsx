import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localized, products } from '../lib/content';
import type { Language } from '../i18n';

const SITE_URL = 'https://iepako.hagroup.lv';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const DEFAULT_IMAGE = `${SITE_URL}/iepako-logo.svg`;

const localeByLanguage: Record<Language, string> = {
  lv: 'lv_LV',
  en: 'en_GB',
  ru: 'ru_RU',
};

const pageDescriptions: Record<Language, Record<string, string>> = {
  lv: {
    '/company': 'IEPAKO tīmekļvietnes operatora SIA HA Group oficiālie reģistrācijas, PVN un saziņas rekvizīti.',
    '/privacy': 'Informācija par personas datu apstrādi IEPAKO piedāvājuma pieprasījuma un saziņas formā.',
    '/cookies': 'Informācija par IEPAKO izmantoto nepieciešamo pārlūka krātuvi un izvēles saglabāšanu.',
  },
  en: {
    '/company': 'Official registration, VAT and contact details for SIA HA Group, the operator of the IEPAKO website.',
    '/privacy': 'How personal data is processed when requesting an IEPAKO packaging quotation or contacting us.',
    '/cookies': 'Information about the necessary browser storage used by the IEPAKO website.',
  },
  ru: {
    '/company': 'Официальные регистрационные данные, номер НДС и контакты SIA HA Group — оператора сайта IEPAKO.',
    '/privacy': 'Как обрабатываются персональные данные при запросе предложения IEPAKO или обращении через форму.',
    '/cookies': 'Информация о необходимом хранилище браузера на сайте IEPAKO.',
  },
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
  const language = ((i18n.resolvedLanguage || i18n.language || 'lv').slice(0, 2) as Language);

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    const canonical = `${SITE_URL}${normalizedPath === '/' ? '/' : normalizedPath}`;
    const isLegal = normalizedPath === '/privacy' || normalizedPath === '/cookies';
    const title = normalizedPath === '/'
      ? t('meta.title')
      : `${t(normalizedPath === '/company' ? 'company.title' : `legal.${normalizedPath.slice(1)}.title`)} | IEPAKO`;
    const description = normalizedPath === '/'
      ? t('meta.description')
      : pageDescriptions[language][normalizedPath] || t('meta.description');
    const robots = window.location.hostname === 'iepako.hagroup.lv'
      ? (isLegal ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
      : 'noindex, nofollow';

    document.documentElement.lang = language;
    document.title = title;
    ensureCanonical(canonical);
    ensureMeta('name', 'description', description);
    ensureMeta('name', 'robots', robots);
    ensureMeta('name', 'googlebot', robots);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:site_name', 'IEPAKO');
    ensureMeta('property', 'og:locale', localeByLanguage[language]);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:url', canonical);
    ensureMeta('property', 'og:image', DEFAULT_IMAGE);
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);
    ensureMeta('name', 'twitter:image', DEFAULT_IMAGE);

    const organization = {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'IEPAKO',
      legalName: 'SIA HA Group',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
      email: 'info@hagroup.lv',
      vatID: 'LV40203724866',
      taxID: '40203724866',
      areaServed: 'Latvia',
      parentOrganization: {
        '@type': 'Organization',
        name: 'HA Group',
        url: 'https://www.hagroup.lv',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales and customer support',
        email: 'info@hagroup.lv',
        availableLanguage: ['Latvian', 'English', 'Russian'],
      },
    };

    const webPage = {
      '@type': normalizedPath === '/' ? 'CollectionPage' : 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: language,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORGANIZATION_ID },
    };

    const productList = normalizedPath === '/' ? {
      '@type': 'ItemList',
      name: t('products.title'),
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          '@id': `${SITE_URL}/#${product.id}`,
          name: localized(product.name, language),
          description: localized(product.description, language),
          category: 'Packaging material',
          url: `${SITE_URL}/#products`,
          brand: { '@type': 'Brand', name: 'IEPAKO' },
          additionalProperty: {
            '@type': 'PropertyValue',
            name: t('products.orderRange'),
            value: localized(product.orderRange, language),
          },
        },
      })),
    } : undefined;

    ensureStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'WebSite',
          '@id': WEBSITE_ID,
          url: `${SITE_URL}/`,
          name: 'IEPAKO',
          publisher: { '@id': ORGANIZATION_ID },
          inLanguage: ['lv', 'en', 'ru'],
        },
        webPage,
        ...(productList ? [productList] : []),
      ],
    });
  }, [i18n.language, i18n.resolvedLanguage, language, pathname, t]);

  return null;
}
