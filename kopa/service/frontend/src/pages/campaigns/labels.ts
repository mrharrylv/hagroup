import { statusBadge } from '../../components/badges';
import type { SortKey } from '../../domain/filters';
import type { AudienceId, CampaignStatus } from '../../domain/types';

/** The translate function from `useI18n`, passed in so these stay pure. */
export type Translate = (key: string, english: string) => string;

export const AUDIENCES: readonly AudienceId[] = ['business', 'individual', 'mixed'];

export const STATUSES: readonly CampaignStatus[] = [
  'new',
  'open',
  'almost-full',
  'closing-soon',
  'funded',
  'closed',
];

/** Radius rungs offered by the rail; `null` is "any distance". */
export const RADIUS_OPTIONS: readonly (number | null)[] = [5, 10, 20, 50, null];

export function audienceLabel(audience: AudienceId, t: Translate): string {
  if (audience === 'business') return t('audience.business', 'Businesses');
  if (audience === 'individual') return t('audience.individual', 'Individuals');
  return t('audience.mixed', 'Everyone');
}

export function statusLabel(status: CampaignStatus, t: Translate): string {
  const badge = statusBadge(status);
  return t(badge.key, badge.label);
}

const SORT_LABELS: Record<SortKey, string> = {
  'ending-soon': 'Ending soon',
  'most-joined': 'Most joined',
  'best-saving': 'Best saving',
  newest: 'Newest',
  'closest-to-goal': 'Closest to goal',
};

export function sortLabel(key: SortKey, t: Translate): string {
  return t(`sort.${key}`, SORT_LABELS[key]);
}

export function radiusLabel(km: number | null, t: Translate): string {
  return km === null ? t('filter.all', 'Any') : `${km} km`;
}
