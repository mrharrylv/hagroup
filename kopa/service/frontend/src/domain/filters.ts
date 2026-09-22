import { categoryById } from '../data/taxonomy';
import { cityById } from '../data/cities';
import { bestPossibleSavingPercent } from './pricing';
import { statusOf, totalsFor } from './status';
import type { AudienceId, Campaign, CampaignStatus, CategoryId, RegionId, UnitId } from './types';

export interface FilterState {
  readonly search: string;
  readonly categories: readonly CategoryId[];
  readonly regions: readonly RegionId[];
  readonly cityId: string | null;
  readonly audience: readonly AudienceId[];
  readonly units: readonly UnitId[];
  readonly statuses: readonly CampaignStatus[];
  readonly minSavingPercent: number;
  readonly maxRadiusKm: number | null;
  readonly minParticipants: number;
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  categories: [],
  regions: [],
  cityId: null,
  audience: [],
  units: [],
  statuses: [],
  minSavingPercent: 0,
  maxRadiusKm: null,
  minParticipants: 0,
};

/** True when nothing is narrowing the list. */
export function isEmptyFilter(filters: FilterState): boolean {
  return (
    filters.search.trim() === '' &&
    filters.categories.length === 0 &&
    filters.regions.length === 0 &&
    filters.cityId === null &&
    filters.audience.length === 0 &&
    filters.units.length === 0 &&
    filters.statuses.length === 0 &&
    filters.minSavingPercent === 0 &&
    filters.maxRadiusKm === null &&
    filters.minParticipants === 0
  );
}

/** How many filter groups are active, for the "3 filters" chip on the top bar. */
export function activeFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.categories.length > 0) count += 1;
  if (filters.regions.length > 0) count += 1;
  if (filters.cityId !== null) count += 1;
  if (filters.audience.length > 0) count += 1;
  if (filters.units.length > 0) count += 1;
  if (filters.statuses.length > 0) count += 1;
  if (filters.minSavingPercent > 0) count += 1;
  if (filters.maxRadiusKm !== null) count += 1;
  if (filters.minParticipants > 0) count += 1;
  return count;
}

/**
 * Free-text match across both demo languages: title, description, keywords,
 * category label, city name and organiser. Typing "petrol" highlights every
 * diesel and petrol campaign in the country, in either language.
 */
export function matchesSearch(campaign: Campaign, rawQuery: string): boolean {
  const query = normalise(rawQuery);
  if (query === '') return true;

  return searchHaystack(campaign).includes(query);
}

/** Everything a campaign can be found by, normalised and pre-joined. */
export function searchHaystack(campaign: Campaign): string {
  const category = categoryById(campaign.category);
  const city = cityById(campaign.cityId);

  return normalise(
    [
      campaign.title.en,
      campaign.title.lv,
      campaign.description.en,
      campaign.description.lv,
      ...campaign.keywords,
      category?.name.en ?? '',
      category?.name.lv ?? '',
      city?.name ?? '',
      campaign.regionId,
      campaign.organizer.name,
      campaign.organizer.org ?? '',
      campaign.unit,
    ].join(' '),
  );
}

/** Whether one campaign passes every active filter. */
export function matchesFilters(campaign: Campaign, filters: FilterState): boolean {
  if (!matchesSearch(campaign, filters.search)) return false;
  if (filters.categories.length > 0 && !filters.categories.includes(campaign.category)) return false;
  if (filters.regions.length > 0 && !filters.regions.includes(campaign.regionId)) return false;
  if (filters.cityId !== null && campaign.cityId !== filters.cityId) return false;
  if (filters.units.length > 0 && !filters.units.includes(campaign.unit)) return false;

  if (filters.audience.length > 0 && !matchesAudience(campaign.audience, filters.audience)) {
    return false;
  }

  if (filters.statuses.length > 0) {
    const totals = totalsFor(campaign, campaign.participants);
    if (!filters.statuses.includes(statusOf(campaign, totals))) return false;
  }

  if (filters.minSavingPercent > 0 && bestPossibleSavingPercent(campaign) < filters.minSavingPercent) {
    return false;
  }

  if (filters.maxRadiusKm !== null && campaign.radiusKm > filters.maxRadiusKm) return false;
  if (campaign.participants.length < filters.minParticipants) return false;

  return true;
}

/**
 * A `mixed` campaign is open to everyone, so it answers to a `business` filter
 * and an `individual` filter alike.
 */
export function matchesAudience(
  campaignAudience: AudienceId,
  wanted: readonly AudienceId[],
): boolean {
  if (wanted.length === 0) return true;
  if (wanted.includes(campaignAudience)) return true;
  return campaignAudience === 'mixed' && (wanted.includes('business') || wanted.includes('individual'));
}

export function applyFilters(
  campaigns: readonly Campaign[],
  filters: FilterState,
): Campaign[] {
  return campaigns.filter((campaign) => matchesFilters(campaign, filters));
}

/**
 * Ids matched by the search box alone, ignoring every other filter. The map
 * highlights these; it does not hide the rest.
 */
export function searchHighlightIds(
  campaigns: readonly Campaign[],
  search: string,
): ReadonlySet<string> {
  if (search.trim() === '') return new Set<string>();
  return new Set(campaigns.filter((c) => matchesSearch(c, search)).map((c) => c.id));
}

export type SortKey = 'ending-soon' | 'most-joined' | 'best-saving' | 'newest' | 'closest-to-goal';

export function sortCampaigns(campaigns: readonly Campaign[], key: SortKey): Campaign[] {
  const copy = [...campaigns];

  switch (key) {
    case 'ending-soon':
      return copy.sort((a, b) => a.endsInDays - b.endsInDays);
    case 'most-joined':
      return copy.sort((a, b) => b.participants.length - a.participants.length);
    case 'best-saving':
      return copy.sort((a, b) => bestPossibleSavingPercent(b) - bestPossibleSavingPercent(a));
    case 'newest':
      return copy.sort((a, b) => a.startedDaysAgo - b.startedDaysAgo);
    case 'closest-to-goal':
      return copy.sort(
        (a, b) =>
          totalsFor(b, b.participants).unitProgress - totalsFor(a, a.participants).unitProgress,
      );
  }
}

/** Lowercase, strip Latvian diacritics, collapse whitespace. */
export function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
