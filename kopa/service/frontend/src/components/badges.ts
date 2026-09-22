import { bestPossibleSavingPercent } from '../domain/pricing';
import { headlineProgress, type CampaignTotals } from '../domain/status';
import type { Campaign, CampaignStatus } from '../domain/types';
import type { BadgeTone } from './ui/Badge';

export interface BadgeSpec {
  readonly key: string;
  readonly tone: BadgeTone;
  /** English label; the caller translates through t(key, label). */
  readonly label: string;
}

export const POPULAR_AT_PARTICIPANTS = 15;
export const BEST_SAVING_AT_PERCENT = 20;

const STATUS_TONE: Record<CampaignStatus, BadgeTone> = {
  new: 'indigo',
  open: 'slate',
  'almost-full': 'amber',
  'closing-soon': 'rose',
  funded: 'emerald',
  closed: 'slate',
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  new: 'New',
  open: 'Open',
  'almost-full': 'Almost full',
  'closing-soon': 'Closing soon',
  funded: 'Goal reached',
  closed: 'Closed',
};

export function statusBadge(status: CampaignStatus): BadgeSpec {
  return { key: `status.${status}`, tone: STATUS_TONE[status], label: STATUS_LABEL[status] };
}

/** Status first, then the optional marketing badges, in a stable order. */
export function badgesFor(
  campaign: Campaign,
  totals: CampaignTotals,
  status: CampaignStatus,
): BadgeSpec[] {
  const badges: BadgeSpec[] = [statusBadge(status)];

  if (totals.buyerCount >= POPULAR_AT_PARTICIPANTS && status !== 'closed') {
    badges.push({ key: 'badge.popular', tone: 'brand', label: 'Popular' });
  }

  if (bestPossibleSavingPercent(campaign) >= BEST_SAVING_AT_PERCENT) {
    badges.push({ key: 'badge.bestSaving', tone: 'emerald', label: 'Best savings' });
  }

  return badges;
}

/** The bar's colour follows how close the campaign is to its goal. */
export function progressTone(totals: CampaignTotals, status: CampaignStatus) {
  if (status === 'closed') return 'slate' as const;
  const progress = headlineProgress(totals);
  if (progress >= 1) return 'emerald' as const;
  if (progress >= 0.8) return 'amber' as const;
  return 'brand' as const;
}
