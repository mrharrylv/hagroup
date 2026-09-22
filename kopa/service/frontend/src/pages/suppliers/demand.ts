import { REGIONS } from '../../data/regions';
import { CATEGORIES } from '../../data/taxonomy';
import { pricingSnapshot, type PricingSnapshot } from '../../domain/pricing';
import { isJoinable, statusOf, totalsFor, type CampaignTotals } from '../../domain/status';
import type { Campaign, CategoryId, RegionId, SupplierBid, UnitId } from '../../domain/types';

/**
 * Supplier-page aggregation.
 *
 * Everything here is pure: it takes the campaign list `useKopa()` hands out and
 * returns the rows the demand board and the bid list render, so a campaign
 * created in the browser moves the numbers on the next render. Nothing in this
 * module sorts, splices or otherwise touches an array it was given — every
 * `sort` below runs on an array `map` or `filter` has just produced.
 */

/** Beyond this the bid list stops being a shortlist and becomes the catalogue. */
export const MAX_BID_TARGETS = 6;

/** Campaigns with this many supplier bids already are not short of interest. */
export const CROWDED_BID_COUNT = 2;

/** One open campaign with its derived numbers computed once. */
export interface Live {
  readonly campaign: Campaign;
  readonly totals: CampaignTotals;
  /** Null when the campaign has no tiers — `pricingSnapshot` throws on an empty ladder. */
  readonly snapshot: PricingSnapshot | null;
}

/** One unit of demand inside a category — categories mix litres, tonnes and pallets. */
export interface UnitTotal {
  readonly unitId: UnitId;
  readonly units: number;
}

export interface BestPrice {
  readonly pricePerUnit: number;
  readonly unitId: UnitId;
  readonly savingPercent: number;
}

export interface DemandRow {
  readonly categoryId: CategoryId;
  readonly openCampaigns: number;
  /** Never summed across unit types: 8 400 L and 40 t do not add up. */
  readonly byUnit: readonly UnitTotal[];
  /** Committed volume priced at today's tier — the only cross-unit comparable. */
  readonly committedValue: number;
  readonly buyers: number;
  readonly best: BestPrice | null;
  readonly regions: readonly RegionId[];
}

/** A campaign that suppliers can still bid on, with the numbers a bid needs. */
export interface BidTarget {
  readonly campaign: Campaign;
  readonly committedUnits: number;
  readonly buyerCount: number;
  readonly currentPrice: number;
  readonly openBids: number;
}

/** The three headline numbers above the board, read off the board's own rows. */
export interface BoardTotals {
  readonly openCampaigns: number;
  readonly committedValue: number;
  readonly buyers: number;
}

/** Persisted demo campaigns can be missing arrays the type promises. */
export function bidsOf(campaign: Campaign): readonly SupplierBid[] {
  return campaign.supplierBids ?? [];
}

/**
 * The campaigns a supplier can still act on, each with its totals and price
 * state resolved once. A closed campaign is history rather than demand, so it
 * never reaches the board, the bid list or the headline stats.
 */
export function liveCampaigns(campaigns: readonly Campaign[]): readonly Live[] {
  return campaigns.flatMap((campaign): Live[] => {
    const participants = campaign.participants ?? [];
    const totals = totalsFor(campaign, participants);
    if (!isJoinable(statusOf(campaign, totals))) return [];

    const tiers = campaign.tiers ?? [];
    return [
      { campaign, totals, snapshot: tiers.length === 0 ? null : pricingSnapshot(campaign, totals) },
    ];
  });
}

/**
 * Committed volume per unit type, largest first.
 *
 * The unit types are deliberately kept apart instead of added up: 8 400 L of
 * diesel and 40 t of fertiliser are not 8 440 of anything, so a single summed
 * quantity would be a number with no physical meaning. The board prints one
 * line per unit on screen for the same reason.
 */
export function unitTotals(entries: readonly Live[]): readonly UnitTotal[] {
  return [...new Set(entries.map((entry) => entry.campaign.unit))]
    .map((unitId) => ({
      unitId,
      units: entries
        .filter((entry) => entry.campaign.unit === unitId)
        .reduce((sum, entry) => sum + entry.totals.committedUnits, 0),
    }))
    .sort((a, b) => b.units - a.units);
}

/** Deepest discount currently unlocked anywhere in the category. */
export function bestPriceIn(entries: readonly Live[]): BestPrice | null {
  return entries.reduce<BestPrice | null>((best, entry) => {
    if (entry.snapshot === null) return best;
    const candidate: BestPrice = {
      pricePerUnit: entry.snapshot.current.pricePerUnit,
      unitId: entry.campaign.unit,
      savingPercent: entry.snapshot.savingPercent,
    };
    if (best === null) return candidate;
    return candidate.savingPercent > best.savingPercent ? candidate : best;
  }, null);
}

/**
 * Committed volume priced at today's tier.
 *
 * This is the one figure that *is* comparable across unit types, which is why
 * the hero stat and the board's "approx." line are money rather than quantity —
 * the quantities themselves are mixed units and must not be summed. A campaign
 * with no tiers has no price to multiply by and contributes nothing.
 */
export function committedValueOf(entries: readonly Live[]): number {
  return entries.reduce(
    (sum, entry) =>
      sum + (entry.snapshot?.current.pricePerUnit ?? 0) * entry.totals.committedUnits,
    0,
  );
}

/**
 * Headcount across a set of open campaigns.
 *
 * One person who joined two campaigns in the same category is counted twice:
 * participants carry no identity across campaigns, so there is nothing to
 * de-duplicate on. The hero stat says so on screen — the buyers figure is
 * described as commitments across all open campaigns, not as distinct people —
 * and the board's Buyers column inherits the same caveat.
 */
export function buyersIn(entries: readonly Live[]): number {
  return entries.reduce((sum, entry) => sum + entry.totals.buyerCount, 0);
}

/** The regions a category is running in, in the canonical `REGIONS` order. */
export function regionsIn(entries: readonly Live[]): readonly RegionId[] {
  return REGIONS.filter((region) =>
    entries.some((entry) => entry.campaign.regionId === region.id),
  ).map((region) => region.id);
}

/**
 * One row per category that has at least one open campaign, richest first.
 *
 * A category with nothing running is dropped rather than rendered as a row of
 * zeros: an empty row reads as a measurement, when it is really an absence.
 * `Array.prototype.sort` is stable, so categories on equal committed value keep
 * `CATEGORIES` order and the board reads the same on every render.
 */
export function demandRows(entries: readonly Live[]): readonly DemandRow[] {
  return CATEGORIES.map((category): DemandRow => {
    const inCategory = entries.filter((entry) => entry.campaign.category === category.id);

    return {
      categoryId: category.id,
      openCampaigns: inCategory.length,
      byUnit: unitTotals(inCategory),
      committedValue: committedValueOf(inCategory),
      buyers: buyersIn(inCategory),
      best: bestPriceIn(inCategory),
      regions: regionsIn(inCategory),
    };
  })
    .filter((row) => row.openCampaigns > 0)
    .sort((a, b) => b.committedValue - a.committedValue);
}

/**
 * The campaigns worth putting in front of a supplier: still open, priceable,
 * and not already crowded with bids. Biggest committed volume first.
 */
export function bidTargets(entries: readonly Live[]): readonly BidTarget[] {
  return entries
    .filter((entry) => entry.snapshot !== null && bidsOf(entry.campaign).length < CROWDED_BID_COUNT)
    .map(
      (entry): BidTarget => ({
        campaign: entry.campaign,
        committedUnits: entry.totals.committedUnits,
        buyerCount: entry.totals.buyerCount,
        currentPrice: entry.snapshot?.current.pricePerUnit ?? 0,
        openBids: bidsOf(entry.campaign).length,
      }),
    )
    .sort((a, b) => b.committedUnits - a.committedUnits)
    .slice(0, MAX_BID_TARGETS);
}

/**
 * The hero's three numbers, added up from the board so the two always agree.
 * `buyers` carries the double-counting caveat described on `buyersIn`, and
 * `committedValue` is money precisely because the quantities cannot be summed.
 */
export function boardTotals(rows: readonly DemandRow[]): BoardTotals {
  return {
    openCampaigns: rows.reduce((sum, row) => sum + row.openCampaigns, 0),
    committedValue: rows.reduce((sum, row) => sum + row.committedValue, 0),
    buyers: rows.reduce((sum, row) => sum + row.buyers, 0),
  };
}
