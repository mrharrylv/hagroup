/**
 * The HA Group brand family.
 *
 * One list feeds both the footer links and the `subOrganization` graph in
 * JSON-LD, so a new brand cannot appear to users but be invisible to a search
 * engine, or the reverse.
 *
 * A note on why these links are visible: the goal is for the sites to pass
 * trust to one another. Links that humans cannot see but crawlers can —
 * `display:none`, off-screen text, colour-on-colour, or markup served only to
 * Googlebot — are cloaking under Google's spam policies, and a manual action
 * would hit every property at once because they share one Organization entity.
 * A real, clickable footer row plus a correct entity graph passes the same
 * signal and is what Google actually documents for a family of brands.
 */

export const HA_GROUP_URL = 'https://www.hagroup.lv';

/** Stable JSON-LD node id for the parent organisation, referenced by each spoke. */
export const ORGANIZATION_ID = `${HA_GROUP_URL}/#organization`;

export interface GroupBrand {
  /** Proper noun — never translated. */
  name: string;
  url: string;
  /** i18n key under `footer.group.brands` for the one-line descriptor. */
  descriptionKey: string;
}

export const GROUP_BRANDS: readonly GroupBrand[] = [
  {
    name: 'HARent',
    url: 'https://harent.lv',
    descriptionKey: 'harent',
  },
  {
    name: 'IEPAKO',
    url: 'https://iepako.hagroup.lv',
    descriptionKey: 'iepako',
  },
  {
    name: 'alwaysup',
    url: 'https://www.alwaysup.lv',
    descriptionKey: 'alwaysup',
  },
];

/** `subOrganization` nodes for the HA Group Organization entity. */
export function buildSubOrganizations() {
  return GROUP_BRANDS.map((brand) => ({
    '@type': 'Organization',
    name: brand.name,
    url: brand.url,
  }));
}
