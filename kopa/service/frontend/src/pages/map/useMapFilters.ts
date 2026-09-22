import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CITIES } from '../../data/cities';
import { REGIONS } from '../../data/regions';
import { CATEGORIES } from '../../data/taxonomy';
import { EMPTY_FILTERS, type FilterState } from '../../domain/filters';
import type { CategoryId, RegionId } from '../../domain/types';

/**
 * Map filter state, half of it in the URL so a filtered map is a link you can
 * send: `?q=`, `?category=`, `?region=`, `?city=` and `?c=<slug>` for the pin
 * whose panel is open. The remaining controls (audience, unit, status and the
 * three sliders) stay in component state — they would bloat the URL without
 * making the link more useful.
 */

const CATEGORY_IDS: readonly string[] = CATEGORIES.map((category) => category.id);
const REGION_IDS: readonly string[] = REGIONS.map((region) => region.id);
const CITY_IDS: readonly string[] = CITIES.map((city) => city.id);

/** The filter fields that are NOT mirrored into the query string. */
type LocalFilters = Pick<
  FilterState,
  'audience' | 'units' | 'statuses' | 'minSavingPercent' | 'maxRadiusKm' | 'minParticipants'
>;

const EMPTY_LOCAL: LocalFilters = {
  audience: EMPTY_FILTERS.audience,
  units: EMPTY_FILTERS.units,
  statuses: EMPTY_FILTERS.statuses,
  minSavingPercent: EMPTY_FILTERS.minSavingPercent,
  maxRadiusKm: EMPTY_FILTERS.maxRadiusKm,
  minParticipants: EMPTY_FILTERS.minParticipants,
};

export interface MapFilters {
  readonly filters: FilterState;
  /** Patch any subset of the filter state; URL-backed keys are routed to the URL. */
  readonly setFilters: (patch: Partial<FilterState>) => void;
  readonly clearAll: () => void;
  readonly toggleCategory: (id: CategoryId) => void;
  /** Slug of the campaign whose side panel is open, from `?c=`. */
  readonly selectedSlug: string | null;
  readonly selectSlug: (slug: string | null) => void;
}

export function useMapFilters(): MapFilters {
  const [params, setParams] = useSearchParams();
  const [local, setLocal] = useState<LocalFilters>(EMPTY_LOCAL);

  const filters = useMemo<FilterState>(
    () => ({
      ...EMPTY_FILTERS,
      ...local,
      search: params.get('q') ?? '',
      categories: parseIds<CategoryId>(params.get('category'), CATEGORY_IDS),
      regions: parseIds<RegionId>(params.get('region'), REGION_IDS),
      cityId: validId(params.get('city'), CITY_IDS),
    }),
    [params, local],
  );

  const setFilters = useCallback(
    (patch: Partial<FilterState>) => {
      const { search, categories, regions, cityId, ...rest } = patch;

      if (Object.keys(rest).length > 0) {
        setLocal((previous) => ({ ...previous, ...rest }));
      }

      if (
        search === undefined &&
        categories === undefined &&
        regions === undefined &&
        cityId === undefined
      ) {
        return;
      }

      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          // The raw query goes into the URL, not a trimmed copy: the input is
          // controlled by this value, so trimming here swallowed the space the
          // moment it was typed and turned "diesel latgale" into "diesellatgale".
          // A whitespace-only query still drops the parameter.
          if (search !== undefined) writeParam(next, 'q', search.trim() === '' ? '' : search);
          if (categories !== undefined) writeParam(next, 'category', categories.join(','));
          if (regions !== undefined) writeParam(next, 'region', regions.join(','));
          if (cityId !== undefined) writeParam(next, 'city', cityId ?? '');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clearAll = useCallback(() => {
    setLocal(EMPTY_LOCAL);
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const key of ['q', 'category', 'region', 'city']) next.delete(key);
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      setFilters({ categories: toggle(filters.categories, id) });
    },
    [filters.categories, setFilters],
  );

  const selectSlug = useCallback(
    (slug: string | null) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          writeParam(next, 'c', slug ?? '');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return {
    filters,
    setFilters,
    clearAll,
    toggleCategory,
    selectedSlug: params.get('c'),
    selectSlug,
  };
}

/** Add or remove one value, never mutating the array it was given. */
export function toggle<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function writeParam(params: URLSearchParams, key: string, value: string): void {
  if (value === '') params.delete(key);
  else params.set(key, value);
}

/** A query string is untrusted input: unknown ids are dropped, not passed on. */
function parseIds<T extends string>(raw: string | null, allowed: readonly string[]): T[] {
  if (raw === null) return [];

  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (allowed.includes(id)) seen.add(id);
  }
  return [...seen] as T[];
}

function validId(raw: string | null, allowed: readonly string[]): string | null {
  if (raw === null) return null;
  return allowed.includes(raw) ? raw : null;
}
