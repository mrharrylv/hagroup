import { cityById } from '../../data/cities';
import { slugify } from '../../state/draft';
import type { CampaignDraft, DraftIssue } from '../../state/draft';
import type { Campaign, Participant, PriceTier } from '../../domain/types';

/** Catchment radii offered as a row of buttons under the pin map. */
export const RADIUS_OPTIONS: readonly number[] = [5, 10, 20, 50];

/** How long a campaign can run, in days. */
export const LENGTH_OPTIONS: readonly number[] = [7, 14, 30, 60, 90];

/** The seeded ladder walks down from retail: full price, −6%, −11%. */
const SEED_FACTORS: readonly number[] = [1, 0.94, 0.89];

const DEFAULT_CITY = 'riga';

/** Identity of the campaign object the live preview renders; never persisted. */
export const PREVIEW_ID = 'draft-preview';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Text inputs must never hand `NaN` or `Infinity` to the pricing domain —
 * `activeTier` and `formatMoney` both turn one into a broken screen.
 */
export function toNumber(raw: string): number {
  const parsed = Number(raw.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Zero renders as an empty box so a field can be cleared and retyped. */
export function numberToInput(value: number): string {
  return value === 0 ? '' : String(value);
}

export type TierSeedInput = Pick<
  CampaignDraft,
  'retailPricePerUnit' | 'tierBasis' | 'targetUnits' | 'targetBuyers'
>;

/**
 * Three sensible starting tiers derived from the retail price and the goal,
 * so the discount ladder is never an empty table the organiser has to invent.
 */
export function seedTiers(input: TierSeedInput): PriceTier[] {
  const goal = Math.max(
    1,
    Math.round(input.tierBasis === 'buyers' ? input.targetBuyers : input.targetUnits),
  );
  const middle = Math.max(2, Math.ceil(goal * 0.4));
  const best = Math.max(middle + 1, Math.ceil(goal * 0.75));
  // An empty retail price must not invent a €1 ladder out of nowhere.
  const retail = input.retailPricePerUnit > 0 ? input.retailPricePerUnit : 0;

  const bounds: readonly (readonly [number, number | null])[] = [
    [0, middle - 1],
    [middle, best - 1],
    [best, null],
  ];

  return bounds.map(([min, max], index) => ({
    min,
    max,
    pricePerUnit: round2(retail * (SEED_FACTORS[index] ?? 1)),
  }));
}

const BASE_DRAFT: CampaignDraft = {
  titleEn: '',
  descriptionEn: '',
  category: 'heating-fuel',
  unit: 'ton',
  audience: 'mixed',
  cityId: DEFAULT_CITY,
  lat: cityById(DEFAULT_CITY)?.lat ?? 56.9496,
  lng: cityById(DEFAULT_CITY)?.lng ?? 24.1052,
  radiusKm: 20,
  targetUnits: 40,
  targetBuyers: 12,
  retailPricePerUnit: 260,
  tierBasis: 'units',
  tiers: [],
  endsInDays: 30,
  organizerName: '',
  organizerType: 'business',
  organizerOrg: '',
  contactEmail: '',
  contactPhone: '',
  ownUnits: 4,
};

export const INITIAL_DRAFT: CampaignDraft = { ...BASE_DRAFT, tiers: seedTiers(BASE_DRAFT) };

/** A tier the pricing domain can safely be handed, whatever was typed. */
function safeTier(tier: PriceTier): PriceTier {
  return {
    min: Number.isFinite(tier.min) ? tier.min : 0,
    max: tier.max === null || !Number.isFinite(tier.max) ? null : tier.max,
    pricePerUnit: Number.isFinite(tier.pricePerUnit) ? Math.max(0, tier.pricePerUnit) : 0,
  };
}

/**
 * The draft rendered as a `Campaign`, so the live preview can reuse
 * `<CampaignCard>` and `<TierLadder>` rather than re-implementing them.
 * Every field is defended: an in-progress draft is allowed to be nonsense.
 */
export function previewCampaign(
  draft: CampaignDraft,
  fallbackTitle: string,
  fallbackName: string,
): Campaign {
  const city = cityById(draft.cityId);
  const title = draft.titleEn.trim() === '' ? fallbackTitle : draft.titleEn.trim();
  const retail = draft.retailPricePerUnit > 0 ? draft.retailPricePerUnit : 0;
  const tiers =
    draft.tiers.length > 0
      ? draft.tiers.map(safeTier)
      : [{ min: 0, max: null, pricePerUnit: retail }];
  const ownUnits = draft.ownUnits > 0 ? draft.ownUnits : 0;
  const org = draft.organizerOrg.trim() === '' ? undefined : draft.organizerOrg.trim();

  const organiser: Participant = {
    id: `${PREVIEW_ID}-organizer`,
    name: draft.organizerName.trim() === '' ? fallbackName : draft.organizerName.trim(),
    type: draft.organizerType,
    org,
    units: ownUnits,
    joinedDaysAgo: 0,
  };

  return {
    id: PREVIEW_ID,
    slug: slugify(title) || 'your-group-buy',
    title: { en: title, lv: title },
    description: { en: draft.descriptionEn, lv: draft.descriptionEn },
    category: draft.category,
    unit: draft.unit,
    audience: draft.audience,
    organizer: { name: organiser.name, type: draft.organizerType, org },
    cityId: draft.cityId,
    regionId: city?.regionId ?? 'riga',
    lat: draft.lat,
    lng: draft.lng,
    radiusKm: draft.radiusKm,
    targetUnits: Math.max(0, draft.targetUnits),
    targetBuyers: Math.max(0, draft.targetBuyers),
    retailPricePerUnit: retail,
    tierBasis: draft.tierBasis,
    tiers,
    endsInDays: Math.max(0, Math.round(draft.endsInDays)),
    startedDaysAgo: 0,
    participants: ownUnits > 0 ? [organiser] : [],
    faq: [],
    keywords: [],
    featured: false,
    supplierBids: [],
  };
}

/** What every form section needs from the page that owns the draft. */
export interface SectionProps {
  readonly draft: CampaignDraft;
  readonly update: (partial: Partial<CampaignDraft>) => void;
  readonly errorFor: (field: keyof CampaignDraft) => string | undefined;
}

/** First message per field, for rendering an error beside its own control. */
export function issuesByField(issues: readonly DraftIssue[]): Readonly<Record<string, string>> {
  return issues.reduce<Record<string, string>>(
    (found, issue) => (issue.field in found ? found : { ...found, [issue.field]: issue.message }),
    {},
  );
}
