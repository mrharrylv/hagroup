import { regionById } from '../../data/regions';
import { categoryById, unitById } from '../../data/taxonomy';
import type { CategoryId, Lang, Localised, RegionId, UnitId } from '../../domain/types';

/** The `loc` function from `useI18n`, passed in so these stay pure. */
export type Localise = (value: Localised) => string;

/** Symbol form, for per-unit prices: "€1.52 / L". */
export function unitShort(unitId: UnitId, lang: Lang): string {
  return unitById(unitId)?.short[lang] ?? unitId;
}

/** Word form, for quantities: "4 800 litres" — matches CampaignCard and TierLadder. */
export function unitLong(unitId: UnitId, lang: Lang): string {
  return unitById(unitId)?.long[lang] ?? unitId;
}

/** The category's own name, falling back to its id rather than to a blank cell. */
export function categoryLabel(id: CategoryId, loc: Localise): string {
  const category = categoryById(id);
  return category === undefined ? id : loc(category.name);
}

export function regionLabel(id: RegionId, loc: Localise): string {
  const region = regionById(id);
  return region === undefined ? id : loc(region.name);
}
