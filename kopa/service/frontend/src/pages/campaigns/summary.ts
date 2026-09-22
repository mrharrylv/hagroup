import { bestPossibleSavingPercent } from '../../domain/pricing';
import { totalsFor } from '../../domain/status';
import type { Campaign, CategoryId, RegionId } from '../../domain/types';

export interface VisibleSummary {
  readonly count: number;
  readonly buyers: number;
  readonly units: number;
  /** Mean of each campaign's best achievable saving, in whole percent. */
  readonly averageSavingPercent: number;
}

/** The four numbers in the slim bar above the grid, over the visible set only. */
export function summarise(campaigns: readonly Campaign[]): VisibleSummary {
  const totals = campaigns.map((campaign) => totalsFor(campaign, campaign.participants));

  const buyers = totals.reduce((sum, item) => sum + item.buyerCount, 0);
  const units = totals.reduce((sum, item) => sum + item.committedUnits, 0);
  const savingSum = campaigns.reduce(
    (sum, campaign) => sum + bestPossibleSavingPercent(campaign),
    0,
  );

  return {
    count: campaigns.length,
    buyers,
    units: Math.round(units * 100) / 100,
    averageSavingPercent: campaigns.length === 0 ? 0 : Math.round(savingSum / campaigns.length),
  };
}

export function categoryCounts(
  campaigns: readonly Campaign[],
): ReadonlyMap<CategoryId, number> {
  return tally(campaigns.map((campaign) => campaign.category));
}

export function regionCounts(campaigns: readonly Campaign[]): ReadonlyMap<RegionId, number> {
  return tally(campaigns.map((campaign) => campaign.regionId));
}

/** Builds a fresh map; nothing passed in is touched. */
function tally<T>(values: readonly T[]): ReadonlyMap<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}
