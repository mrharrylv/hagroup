import type { Campaign, PriceTier } from './types';

/** The quantity a campaign's tiers are measured against. */
export function tierMetric(
  campaign: Pick<Campaign, 'tierBasis'>,
  totals: { committedUnits: number; buyerCount: number },
): number {
  return campaign.tierBasis === 'buyers' ? totals.buyerCount : totals.committedUnits;
}

/** Tiers sorted cheapest-last, i.e. by ascending threshold. */
export function sortedTiers(tiers: readonly PriceTier[]): PriceTier[] {
  return [...tiers].sort((a, b) => a.min - b.min);
}

/**
 * The tier a given quantity currently sits in.
 * Below the first tier's floor the first tier still applies — it is the
 * "1 or more buyers" retail-ish rung, never a missing price.
 */
export function activeTier(tiers: readonly PriceTier[], metric: number): PriceTier {
  const ordered = sortedTiers(tiers);
  if (ordered.length === 0) throw new Error('a campaign must have at least one price tier');

  let current = ordered[0];
  for (const tier of ordered) {
    if (metric >= tier.min) current = tier;
  }
  return current;
}

/** The next cheaper tier, or null when the best tier is already unlocked. */
export function nextTier(tiers: readonly PriceTier[], metric: number): PriceTier | null {
  const ordered = sortedTiers(tiers);
  return ordered.find((tier) => tier.min > metric) ?? null;
}

/** How much more of the tier metric is needed to unlock the next tier. */
export function amountToNextTier(tiers: readonly PriceTier[], metric: number): number | null {
  const next = nextTier(tiers, metric);
  if (next === null) return null;
  return Math.max(0, next.min - metric);
}

export interface PricingSnapshot {
  readonly metric: number;
  readonly current: PriceTier;
  readonly next: PriceTier | null;
  readonly toNext: number | null;
  readonly savingPerUnit: number;
  readonly savingPercent: number;
  readonly totalSaving: number;
  readonly nextSavingPerUnit: number | null;
}

/** Everything the UI needs to render a campaign's price state, in one pass. */
export function pricingSnapshot(
  campaign: Campaign,
  totals: { committedUnits: number; buyerCount: number },
): PricingSnapshot {
  const metric = tierMetric(campaign, totals);
  const current = activeTier(campaign.tiers, metric);
  const next = nextTier(campaign.tiers, metric);
  const savingPerUnit = round2(campaign.retailPricePerUnit - current.pricePerUnit);

  return {
    metric,
    current,
    next,
    toNext: amountToNextTier(campaign.tiers, metric),
    savingPerUnit,
    savingPercent:
      campaign.retailPricePerUnit === 0
        ? 0
        : Math.round((savingPerUnit / campaign.retailPricePerUnit) * 100),
    totalSaving: round2(savingPerUnit * totals.committedUnits),
    nextSavingPerUnit: next === null ? null : round2(campaign.retailPricePerUnit - next.pricePerUnit),
  };
}

/** The cheapest price any tier of this campaign can reach. */
export function bestPossiblePrice(tiers: readonly PriceTier[]): number {
  return Math.min(...tiers.map((tier) => tier.pricePerUnit));
}

/** Headline saving used for sorting and for the "Best savings" badge, in percent. */
export function bestPossibleSavingPercent(campaign: Campaign): number {
  if (campaign.retailPricePerUnit === 0) return 0;
  const best = bestPossiblePrice(campaign.tiers);
  return Math.round(((campaign.retailPricePerUnit - best) / campaign.retailPricePerUnit) * 100);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
