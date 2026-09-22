import { bestPossibleSavingPercent } from '../../domain/pricing';
import { isJoinable, statusOf, totalsFor } from '../../domain/status';
import type { Campaign, CategoryId, RegionId } from '../../domain/types';

/**
 * Homepage derivations. Everything here is computed from the live campaign list
 * handed out by `useKopa()` — nothing about the landing page is hardcoded, so a
 * campaign created in the browser moves the numbers straight away.
 */

export interface Tally<Id extends string> {
  readonly id: Id;
  /** How many campaigns share this key. */
  readonly count: number;
  /** Buyers joined across those campaigns. */
  readonly buyers: number;
}

/** Participant headcount for one campaign, via the shared totals helper. */
export function buyersIn(campaign: Campaign): number {
  return totalsFor(campaign, campaign.participants).buyerCount;
}

/** A campaign anybody can still join — i.e. not closed. */
export function isActive(campaign: Campaign): boolean {
  return isJoinable(statusOf(campaign, totalsFor(campaign, campaign.participants)));
}

/**
 * The subset every "right now" claim on this page is allowed to count.
 * A closed group buy is history, not demand, so it must not win a ranking
 * headed "most active this week" or "people here are interested in…".
 */
export function activeCampaigns(campaigns: readonly Campaign[]): readonly Campaign[] {
  return campaigns.filter(isActive);
}

/**
 * `bestPossibleSavingPercent` divides by the retail price and takes `Math.min`
 * over the tiers, so a campaign with no tiers yields `-Infinity`. Averaging that
 * in would render "−Infinity%" or "NaN%", so such a campaign is dropped instead.
 */
export function savingPercentOf(campaign: Campaign): number | null {
  const percent = bestPossibleSavingPercent(campaign);
  return Number.isFinite(percent) ? percent : null;
}

/** Campaign and buyer counts per key, most active first. */
export function tallyBy<Id extends string>(
  campaigns: readonly Campaign[],
  key: (campaign: Campaign) => Id,
): readonly Tally<Id>[] {
  const counts = campaigns.reduce<Readonly<Record<string, Tally<Id>>>>((acc, campaign) => {
    const id = key(campaign);
    const seen = acc[id];
    return {
      ...acc,
      [id]: {
        id,
        count: (seen?.count ?? 0) + 1,
        buyers: (seen?.buyers ?? 0) + buyersIn(campaign),
      },
    };
  }, {});

  return Object.values(counts).sort((a, b) => b.count - a.count || b.buyers - a.buyers);
}

export function topRegions(campaigns: readonly Campaign[]): readonly Tally<RegionId>[] {
  return tallyBy(campaigns, (campaign) => campaign.regionId);
}

export function topCategories(campaigns: readonly Campaign[]): readonly Tally<CategoryId>[] {
  return tallyBy(campaigns, (campaign) => campaign.category);
}

export function topCities(campaigns: readonly Campaign[]): readonly Tally<string>[] {
  return tallyBy(campaigns, (campaign) => campaign.cityId);
}

/** Campaigns with the most buyers first; ties broken by committed volume. */
export function mostJoined(campaigns: readonly Campaign[]): readonly Campaign[] {
  return [...campaigns].sort((a, b) => {
    const byBuyers = buyersIn(b) - buyersIn(a);
    if (byBuyers !== 0) return byBuyers;
    return (
      totalsFor(b, b.participants).committedUnits - totalsFor(a, a.participants).committedUnits
    );
  });
}

export interface HomeSummary {
  readonly activeCount: number;
  readonly totalBuyers: number;
  /** Mean of every campaign's best achievable saving, in whole percent. */
  readonly averageSavingPercent: number;
  /** Null while nothing is running — no campaigns at all, or all of them closed. */
  readonly topRegion: Tally<RegionId> | null;
}

export function summarise(campaigns: readonly Campaign[]): HomeSummary {
  const live = activeCampaigns(campaigns);
  const savings = campaigns
    .map(savingPercentOf)
    .filter((percent): percent is number => percent !== null);
  const savingTotal = savings.reduce((sum, percent) => sum + percent, 0);

  return {
    activeCount: live.length,
    totalBuyers: campaigns.reduce((sum, campaign) => sum + buyersIn(campaign), 0),
    averageSavingPercent: savings.length === 0 ? 0 : Math.round(savingTotal / savings.length),
    // Ranked over the live subset so it agrees with "People in <region>" below.
    topRegion: topRegions(live)[0] ?? null,
  };
}
