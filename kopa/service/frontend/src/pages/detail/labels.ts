import { unitById } from '../../data/taxonomy';
import type { AudienceId, BuyerType, Campaign, Lang } from '../../domain/types';

type Translate = (key: string, english: string) => string;

/** "today" / "yesterday" / "5 days ago" — participants store a day offset, not a date. */
export function daysAgoLabel(days: number, t: Translate): string {
  if (days <= 0) return t('time.today.joined', 'today');
  if (days === 1) return t('time.yesterday', 'yesterday');
  return `${days} ${t('time.daysAgo', 'days ago')}`;
}

/**
 * The noun a campaign's tier metric is counted in — "buyers" when the supplier
 * prices per delivery drop, otherwise the campaign's own unit.
 */
export function metricNoun(campaign: Campaign, lang: Lang, t: Translate): string {
  if (campaign.tierBasis === 'buyers') return t('campaign.buyers', 'buyers');
  return unitById(campaign.unit)?.long[lang] ?? campaign.unit;
}

/** Plural unit noun, e.g. "litres". */
export function unitLong(campaign: Campaign, lang: Lang): string {
  return unitById(campaign.unit)?.long[lang] ?? campaign.unit;
}

/** Short unit noun used after a price, e.g. "L". */
export function unitShort(campaign: Campaign, lang: Lang): string {
  return unitById(campaign.unit)?.short[lang] ?? campaign.unit;
}

export function audienceLabel(audience: AudienceId, t: Translate): string {
  if (audience === 'business') return t('audience.business', 'Businesses');
  if (audience === 'individual') return t('audience.individual', 'Individuals');
  return t('audience.mixed', 'Businesses and individuals');
}

export function buyerTypeLabel(type: BuyerType, t: Translate): string {
  return type === 'business'
    ? t('audience.business.one', 'business')
    : t('audience.individual.one', 'individual');
}

/** First name only — the participant list is deliberately low-ceremony. */
export function firstName(name: string): string {
  return name.replace(/\s*\(you\)\s*$/i, '').split(' ')[0] ?? name;
}

/** Demo joins made in this browser are suffixed " (you)" by the store. */
export function isYou(name: string): boolean {
  return /\(you\)\s*$/i.test(name);
}

export function initialOf(name: string): string {
  return (firstName(name)[0] ?? '?').toUpperCase();
}
