import { cityById } from '../../data/cities';
import { regionById } from '../../data/regions';
import { categoryById, unitById } from '../../data/taxonomy';
import type { FilterState } from '../../domain/filters';
import type { Localised } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { toggleValue } from './filterParams';
import { audienceLabel, radiusLabel, statusLabel } from './labels';

interface Chip {
  readonly id: string;
  readonly label: string;
  readonly remove: () => void;
}

/** One removable chip per active filter, so nothing narrows the list invisibly. */
export function FilterChips({
  filters,
  onChange,
  onClear,
}: {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
}) {
  const { t, loc } = useI18n();
  const search = filters.search.trim();
  const city = filters.cityId === null ? undefined : cityById(filters.cityId);

  const chips: readonly Chip[] = [
    ...(search === ''
      ? []
      : [{ id: 'q', label: `“${search}”`, remove: () => onChange({ search: '' }) }]),

    ...filters.categories.map((id) => ({
      id: `cat-${id}`,
      label: locOrId(categoryById(id)?.name, id, loc),
      remove: () => onChange({ categories: toggleValue(filters.categories, id) }),
    })),

    ...filters.regions.map((id) => ({
      id: `reg-${id}`,
      label: locOrId(regionById(id)?.name, id, loc),
      remove: () => onChange({ regions: toggleValue(filters.regions, id) }),
    })),

    ...(city === undefined
      ? []
      : [{ id: 'city', label: city.name, remove: () => onChange({ cityId: null }) }]),

    ...filters.audience.map((id) => ({
      id: `aud-${id}`,
      label: audienceLabel(id, t),
      remove: () => onChange({ audience: toggleValue(filters.audience, id) }),
    })),

    ...filters.units.map((id) => ({
      id: `unit-${id}`,
      label: locOrId(unitById(id)?.long, id, loc),
      remove: () => onChange({ units: toggleValue(filters.units, id) }),
    })),

    ...filters.statuses.map((status) => ({
      id: `status-${status}`,
      label: statusLabel(status, t),
      remove: () => onChange({ statuses: toggleValue(filters.statuses, status) }),
    })),

    ...(filters.minSavingPercent === 0
      ? []
      : [
          {
            id: 'saving',
            label: `${t('filter.saving', 'Saving')} ≥ ${filters.minSavingPercent}%`,
            remove: () => onChange({ minSavingPercent: 0 }),
          },
        ]),

    ...(filters.maxRadiusKm === null
      ? []
      : [
          {
            id: 'radius',
            label: `${t('filter.within', 'Within')} ${radiusLabel(filters.maxRadiusKm, t)}`,
            remove: () => onChange({ maxRadiusKm: null }),
          },
        ]),

    ...(filters.minParticipants === 0
      ? []
      : [
          {
            id: 'buyers',
            label: `${filters.minParticipants}+ ${t('campaign.participants', 'buyers')}`,
            remove: () => onChange({ minParticipants: 0 }),
          },
        ]),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.remove}
          className="focus-visible:outline-brand-600 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2"
        >
          <span>{chip.label}</span>
          <span aria-hidden="true" className="text-slate-400">
            ×
          </span>
          <span className="sr-only">{t('filter.remove', 'Remove this filter')}</span>
        </button>
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClear}
          className="focus-visible:outline-brand-600 rounded-full px-2 py-0.5 text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800 focus-visible:outline-2"
        >
          {t('cta.clear', 'Clear all')}
        </button>
      )}
    </div>
  );
}

function locOrId(
  value: Localised | undefined,
  fallback: string,
  loc: (value: Localised) => string,
): string {
  return value === undefined ? fallback : loc(value);
}
