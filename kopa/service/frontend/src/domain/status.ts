import type { Campaign, CampaignStatus, Participant } from './types';

export interface CampaignTotals {
  readonly committedUnits: number;
  readonly buyerCount: number;
  readonly unitProgress: number;
  readonly buyerProgress: number;
}

export function totalsFor(
  campaign: Pick<Campaign, 'targetUnits' | 'targetBuyers'>,
  participants: readonly Participant[],
): CampaignTotals {
  const committedUnits = participants.reduce((sum, p) => sum + p.units, 0);
  const buyerCount = participants.length;

  return {
    committedUnits,
    buyerCount,
    unitProgress: ratio(committedUnits, campaign.targetUnits),
    buyerProgress: ratio(buyerCount, campaign.targetBuyers),
  };
}

/** Progress the UI shows on the bar: whichever goal is further along. */
export function headlineProgress(totals: CampaignTotals): number {
  return Math.max(totals.unitProgress, totals.buyerProgress);
}

export const ALMOST_FULL_AT = 0.8;
export const CLOSING_SOON_DAYS = 5;
export const NEW_FOR_DAYS = 4;

export function statusOf(campaign: Campaign, totals: CampaignTotals): CampaignStatus {
  if (campaign.endsInDays < 0) return 'closed';

  const progress = headlineProgress(totals);
  if (progress >= 1) return 'funded';
  if (progress >= ALMOST_FULL_AT) return 'almost-full';
  if (campaign.endsInDays <= CLOSING_SOON_DAYS) return 'closing-soon';
  if (campaign.startedDaysAgo <= NEW_FOR_DAYS) return 'new';
  return 'open';
}

/** Statuses a campaign can still be joined in. */
export function isJoinable(status: CampaignStatus): boolean {
  return status !== 'closed';
}

function ratio(value: number, target: number): number {
  if (target <= 0) return 0;
  return value / target;
}
