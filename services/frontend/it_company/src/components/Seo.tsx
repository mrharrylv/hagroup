import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/useLocale';
import { applyHeadTags } from '../seo/applyHead';
import { buildSeo } from '../seo/buildSeo';
import { seoContentFor } from '../seo/content';
import { headTags } from '../seo/headTags';
import { OFF_SITE_ROBOTS, isProductionHost } from '../seo/site';

/**
 * Keeps <head> right while the visitor navigates. The prerender already wrote
 * every page's tags into its HTML; this computes the same values with the same
 * buildSeo call and updates the tags in place. The one difference is robots:
 * any host other than www.hagroup.lv (previews, local builds) is told
 * noindex, nofollow at runtime.
 */
export default function Seo() {
  const { pathname } = useLocation();
  const { lang } = useLocale();

  useEffect(() => {
    try {
      const seo = buildSeo({ path: pathname, lang, content: seoContentFor(lang) });
      const robots = isProductionHost(window.location.hostname) ? seo.robots : OFF_SITE_ROBOTS;
      applyHeadTags(document, headTags({ ...seo, robots }));
      document.documentElement.lang = lang;
    } catch (error) {
      console.error(`[Seo] Could not update the head for ${pathname} (${lang}):`, error);
    }
  }, [pathname, lang]);

  return null;
}
