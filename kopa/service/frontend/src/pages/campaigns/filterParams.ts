import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CITIES } from '../../data/cities';
import { REGIONS } from '../../data/regions';
import { CATEGORIES } from '../../data/taxonomy';
import { EMPTY_FILTERS } from '../../domain/filters';
import type { FilterState, SortKey } from '../../domain/filters';
import type { AudienceId, CategoryId, RegionId } from '../../domain/types';
import { AUDIENCES } from './labels';

export const SORT_KEYS: readonly SortKey[] = [
  'ending-soon',
  'most-joined',
  'best-saving',
  'newest',
  'closest-to-goal',
];

export const DEFAULT_SORT: SortKey = 'ending-soon';

/** The five filter keys that live in the URL, so a filtered list is linkable. */
const URL_KEYS = ['search', 'categories', 'regions', 'cityId', 'audience'] as const;

/** Everything else stays in component state — useful, but not worth a query string. */
type LocalFilters = Pick<
  FilterState,
  'units' | 'statuses' | 'minSavingPercent' | 'maxRadiusKm' | 'minParticipants'
>;

const EMPTY_LOCAL: LocalFilters = {
  units: EMPTY_FILTERS.units,
  statuses: EMPTY_FILTERS.statuses,
  minSavingPercent: EMPTY_FILTERS.minSavingPercent,
  maxRadiusKm: EMPTY_FILTERS.maxRadiusKm,
  minParticipants: EMPTY_FILTERS.minParticipants,
};

const CATEGORY_IDS: readonly string[] = CATEGORIES.map((category) => category.id);
const REGION_IDS: readonly string[] = REGIONS.map((region) => region.id);
const CITY_IDS: readonly string[] = CITIES.map((city) => city.id);
const AUDIENCE_IDS: readonly string[] = AUDIENCES;

export interface CampaignFilters {
  readonly filters: FilterState;
  readonly sort: SortKey;
  /** Merge a partial change; URL-backed keys are pushed to the query string. */
  readonly update: (patch: Partial<FilterState>) => void;
  readonly setSort: (key: SortKey) => void;
  readonly clearAll: () => void;
}

/**
 * The page's whole `FilterState`, half of it derived from `useSearchParams` so
 * that `/campaigns?category=heating-fuel&region=kurzeme` is a working link.
 * Unknown ids in the query string are dropped rather than trusted.
 */
export function useCampaignFilters(): CampaignFilters {
  const [params, setParams] = useSearchParams();
  const [local, setLocal] = useState<LocalFilters>(EMPTY_LOCAL);

  const filters = useMemo<FilterState>(
    () => ({
      ...EMPTY_FILTERS,
      search: params.get('q') ?? '',
      categories: readList<CategoryId>(params, 'category', CATEGORY_IDS),
      regions: readList<RegionId>(params, 'region', REGION_IDS),
      cityId: readCity(params.get('city')),
      audience: readList<AudienceId>(params, 'audience', AUDIENCE_IDS),
      ...local,
    }),
    [params, local],
  );

  const sort = parseSort(params.get('sort'));

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      const localPatch = pickLocal(patch);
      if (Object.keys(localPatch).length > 0) {
        setLocal((previous) => ({ ...previous, ...localPatch }));
      }

      if (URL_KEYS.some((key) => patch[key] !== undefined)) {
        // Typing in the search box should not stack up history entries.
        setParams((previous) => writeUrl(previous, patch), { replace: patch.search !== undefined });
      }
    },
    [setParams],
  );

  const setSort = useCallback(
    (key: SortKey) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        if (key === DEFAULT_SORT) next.delete('sort');
        else next.set('sort', key);
        return next;
      });
    },
    [setParams],
  );

  const clearAll = useCallback(() => {
    setLocal(EMPTY_LOCAL);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      for (const key of ['q', 'category', 'region', 'city', 'audience']) next.delete(key);
      return next;
    });
  }, [setParams]);

  return { filters, sort, update, setSort, clearAll };
}

/** Add or remove one value, always returning a new array. */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function writeUrl(previous: URLSearchParams, patch: Partial<FilterState>): URLSearchParams {
  const next = new URLSearchParams(previous);

  // Not trimmed: the input is controlled by this value, so trimming here would
  // eat the space the moment the user typed it.
  if (patch.search !== undefined) setOrDelete(next, 'q', patch.search);
  if (patch.categories !== undefined) setOrDelete(next, 'category', patch.categories.join(','));
  if (patch.regions !== undefined) setOrDelete(next, 'region', patch.regions.join(','));
  if (patch.cityId !== undefined) setOrDelete(next, 'city', patch.cityId ?? '');
  if (patch.audience !== undefined) setOrDelete(next, 'audience', patch.audience.join(','));

  return next;
}

function setOrDelete(params: URLSearchParams, key: string, value: string): void {
  if (value === '') params.delete(key);
  else params.set(key, value);
}

function pickLocal(patch: Partial<FilterState>): Partial<LocalFilters> {
  return {
    ...(patch.units !== undefined ? { units: patch.units } : {}),
    ...(patch.statuses !== undefined ? { statuses: patch.statuses } : {}),
    ...(patch.minSavingPercent !== undefined
      ? { minSavingPercent: patch.minSavingPercent }
      : {}),
    ...(patch.maxRadiusKm !== undefined ? { maxRadiusKm: patch.maxRadiusKm } : {}),
    ...(patch.minParticipants !== undefined ? { minParticipants: patch.minParticipants } : {}),
  };
}

/** Comma-separated ids, deduplicated, with anything unrecognised thrown away. */
function readList<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly string[],
): T[] {
  const raw = params.get(key);
  if (raw === null) return [];

  const kept = raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => allowed.includes(part));

  return [...new Set(kept)] as T[];
}

function readCity(raw: string | null): string | null {
  if (raw === null) return null;
  return CITY_IDS.includes(raw) ? raw : null;
}

function parseSort(raw: string | null): SortKey {
  return SORT_KEYS.find((key) => key === raw) ?? DEFAULT_SORT;
}
