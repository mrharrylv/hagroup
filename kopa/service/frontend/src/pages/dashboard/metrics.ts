import { REGIONS } from '../../data/regions';
import { CATEGORIES, UNITS } from '../../data/taxonomy';
import { pricingSnapshot, type PricingSnapshot } from '../../domain/pricing';
import {
  headlineProgress,
  isJoinable,
  statusOf,
  totalsFor,
  type CampaignTotals,
} from '../../domain/status';
import type { Campaign, CampaignStatus, Localised, UnitId } from '../../domain/types';

/**
 * Pure derivations behind the dashboard. Every number on that page comes from
 * the campaign list `useKopa()` hands out, so a campaign created in this
 * browser moves the console straight away. Nothing here touches React, and
 * nothing here mutates the array it is given.
 */

/** Everything the console needs about one campaign, computed once. */
export interface Facts {
  readonly campaign: Campaign;
  readonly totals: CampaignTotals;
  readonly pricing: PricingSnapshot;
  readonly status: CampaignStatus;
  readonly progress: number;
  /** Committed volume valued at the tier price unlocked so far, in EUR. */
  readonly value: number;
}

/**
 * Committed volume for one unit of measure.
 * Litres, tonnes, m³, pallets and cartons are never added together — a single
 * "units" figure across a region would be a number with no dimension.
 */
export interface UnitTotal {
  readonly unitId: UnitId;
  readonly units: number;
}

export interface GroupRow {
  readonly key: string;
  readonly label: string;
  readonly icon?: string;
  readonly campaigns: number;
  readonly buyers: number;
  readonly unitTotals: readonly UnitTotal[];
  /** Unweighted mean of each campaign's current saving, in whole percent. */
  readonly savingPercent: number;
}

export interface StatusRow {
  readonly status: CampaignStatus;
  readonly count: number;
}

export interface DashboardSummary {
  readonly campaignCount: number;
  readonly openCount: number;
  readonly totalBuyers: number;
  readonly totalValue: number;
  readonly totalSaving: number;
  /** Mean of each campaign's headline progress, 0–1. No campaigns → 0, not NaN. */
  readonly averageProgress: number;
}

/** One group to roll campaigns up into: a region, a category, anything keyed. */
export interface GroupSpec {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
}

/** `loc` from `useI18n()`, narrowed to what the rollups actually need. */
export type Localise = (value: Localised) => string;

export const STATUS_ORDER: readonly CampaignStatus[] = [
  'new',
  'open',
  'almost-full',
  'closing-soon',
  'funded',
  'closed',
];

export const CLOSING_SOON_WITHIN_DAYS = 7;

/** Progress at which a campaign has met its goal and stops needing help. */
export const GOAL_PROGRESS = 1;

/** Mirrors the id KopaProvider gives the organiser's own commitment row. */
export const ORGANISER_ID_SUFFIX = '-organizer';

const PERCENT_SCALE = 100;

/**
 * `pricingSnapshot` throws when a campaign has no price tiers, and a campaign
 * restored from localStorage is only shape-checked, never validated. Skipping
 * those keeps one hand-edited row from blanking the whole route.
 */
export function factsFor(campaign: Campaign): Facts | null {
  if (campaign.tiers.length === 0) return null;

  const totals = totalsFor(campaign, campaign.participants);
  const pricing = pricingSnapshot(campaign, totals);
  return {
    campaign,
    totals,
    pricing,
    status: statusOf(campaign, totals),
    progress: headlineProgress(totals),
    value: totals.committedUnits * pricing.current.pricePerUnit,
  };
}

/** Facts for every campaign that can be priced; the rest are left out. */
export function factsForAll(campaigns: readonly Campaign[]): readonly Facts[] {
  return campaigns.map(factsFor).filter((facts): facts is Facts => facts !== null);
}

export function summarise(facts: readonly Facts[]): DashboardSummary {
  const progressTotal = facts.reduce((sum, f) => sum + f.progress, 0);

  return {
    campaignCount: facts.length,
    openCount: facts.filter((f) => isJoinable(f.status)).length,
    totalBuyers: facts.reduce((sum, f) => sum + f.totals.buyerCount, 0),
    totalValue: facts.reduce((sum, f) => sum + f.value, 0),
    totalSaving: facts.reduce((sum, f) => sum + f.pricing.totalSaving, 0),
    averageProgress: facts.length === 0 ? 0 : progressTotal / facts.length,
  };
}

/** Committed volume per unit of measure, in the taxonomy's own order. */
export function unitTotalsOf(facts: readonly Facts[]): readonly UnitTotal[] {
  const byUnit = facts.reduce<Readonly<Record<string, number>>>(
    (acc, f) => ({
      ...acc,
      [f.campaign.unit]: (acc[f.campaign.unit] ?? 0) + f.totals.committedUnits,
    }),
    {},
  );

  return UNITS.map((unit) => ({ unitId: unit.id, units: byUnit[unit.id] ?? 0 })).filter(
    (total) => total.units > 0,
  );
}

export function groupOf(
  facts: readonly Facts[],
  key: string,
  label: string,
  icon?: string,
): GroupRow {
  return {
    key,
    label,
    icon,
    campaigns: facts.length,
    buyers: facts.reduce((sum, f) => sum + f.totals.buyerCount, 0),
    unitTotals: unitTotalsOf(facts),
    savingPercent:
      facts.length === 0
        ? 0
        : Math.round(facts.reduce((sum, f) => sum + f.pricing.savingPercent, 0) / facts.length),
  };
}

/** Rows for the groups that have at least one campaign, busiest first. */
export function rollupBy(
  facts: readonly Facts[],
  groups: readonly GroupSpec[],
  keyOf: (facts: Facts) => string,
): readonly GroupRow[] {
  return groups
    .map((group) =>
      groupOf(
        facts.filter((f) => keyOf(f) === group.id),
        group.id,
        group.label,
        group.icon,
      ),
    )
    .filter((row) => row.campaigns > 0)
    .sort((a, b) => b.buyers - a.buyers);
}

export function regionRollup(facts: readonly Facts[], loc: Localise): readonly GroupRow[] {
  const groups = REGIONS.map((region) => ({ id: region.id, label: loc(region.name) }));
  return rollupBy(facts, groups, (f) => f.campaign.regionId);
}

export function categoryRollup(facts: readonly Facts[], loc: Localise): readonly GroupRow[] {
  const groups = CATEGORIES.map((category) => ({
    id: category.id,
    label: loc(category.name),
    icon: category.icon,
  }));
  return rollupBy(facts, groups, (f) => f.campaign.category);
}

/** Every status in a fixed order, including the ones nothing sits in. */
export function statusRollup(facts: readonly Facts[]): readonly StatusRow[] {
  return STATUS_ORDER.map((status) => ({
    status,
    count: facts.filter((f) => f.status === status).length,
  }));
}

/**
 * Campaigns that run out of time this week while still short of their goal —
 * the only ones a nudge can still help. Already closed, or already funded,
 * belongs to neither.
 */
export function closingSoon(facts: readonly Facts[]): readonly Facts[] {
  // filter() copies first, so the sort never touches the store's array.
  return facts
    .filter(
      (f) =>
        f.campaign.endsInDays >= 0 &&
        f.campaign.endsInDays <= CLOSING_SOON_WITHIN_DAYS &&
        f.progress < GOAL_PROGRESS,
    )
    .sort((a, b) => a.campaign.endsInDays - b.campaign.endsInDays);
}

/** Campaigns you joined or started, in the order the store lists them. */
export function involvedIn(
  facts: readonly Facts[],
  isInvolved: (campaignId: string) => boolean,
): readonly Facts[] {
  return facts.filter((f) => isInvolved(f.campaign.id));
}

/** Units you personally committed: your joins plus, on your own campaign, its seed. */
export function yourUnits(campaign: Campaign, joinedUnits: number, isOrganiser: boolean): number {
  if (!isOrganiser) return joinedUnits;
  const seed = campaign.participants.find((p) => p.id === `${campaign.id}${ORGANISER_ID_SUFFIX}`);
  return joinedUnits + (seed?.units ?? 0);
}

export function share(part: number, whole: number): number {
  return whole <= 0 ? 0 : part / whole;
}

/** A 0–1 fraction as whole percent. */
export function toPercent(fraction: number): number {
  return Math.round(fraction * PERCENT_SCALE);
}

export function percent(part: number, whole: number): number {
  return toPercent(share(part, whole));
}
