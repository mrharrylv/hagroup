import { useId, type ReactNode } from 'react';
import { statusBadge } from '../../components/badges';
import { CITIES, cityById } from '../../data/cities';
import { REGIONS } from '../../data/regions';
import { UNITS } from '../../data/taxonomy';
import { activeFilterCount, type FilterState } from '../../domain/filters';
import { useI18n } from '../../i18n/useI18n';
import { toggle } from './useMapFilters';
import type { AudienceId, CampaignStatus, RegionId, UnitId } from '../../domain/types';

const AUDIENCES: readonly { id: AudienceId; key: string; label: string }[] = [
  { id: 'business', key: 'audience.business', label: 'Business' },
  { id: 'individual', key: 'audience.individual', label: 'Individuals' },
  { id: 'mixed', key: 'audience.mixed', label: 'Everyone' },
];

const STATUSES: readonly CampaignStatus[] = [
  'new',
  'open',
  'almost-full',
  'closing-soon',
  'funded',
  'closed',
];

/** The slider's top notch means "no limit", which is stored as null. */
const RADIUS_MAX_KM = 200;
const SAVING_MAX_PERCENT = 40;
const PARTICIPANTS_MAX = 30;

/**
 * Floating filter panel, anchored under the Filters button. Everything the
 * top bar does not have room for lives here, and each control writes straight
 * back into the shared FilterState.
 */
export function MapFilterPanel({
  filters,
  onChange,
  onClear,
  onClose,
}: {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { t, loc } = useI18n();
  const ids = useId();
  const count = activeFilterCount(filters);

  const inRegion =
    filters.regions.length === 0
      ? CITIES
      : CITIES.filter((city) => filters.regions.includes(city.regionId));

  /**
   * A city chosen before a region was picked stays in the list even when the
   * region no longer contains it. Dropping it would leave the select showing
   * "Any city" while the filter was still narrowing the map to that city.
   */
  const chosen = filters.cityId === null ? undefined : cityById(filters.cityId);
  const cities =
    chosen === undefined || inRegion.some((city) => city.id === chosen.id)
      ? inRegion
      : [chosen, ...inRegion];

  return (
    <div className="pointer-events-none absolute top-32 right-3 left-3 z-[700] mx-auto flex max-w-4xl justify-end">
      <section
        aria-label={t('filters.title', 'Filters')}
        className="pointer-events-auto max-h-[60vh] w-[320px] max-w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {t('filters.title', 'Filters')}
            {count > 0 && <span className="ml-1 text-slate-400 tabular-nums">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cta.close', 'Close')}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </header>

        <div className="space-y-4 px-4 py-4">
          <Group title={t('filters.audience', 'Who it is for')}>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCES.map((audience) => (
                <Pill
                  key={audience.id}
                  active={filters.audience.includes(audience.id)}
                  onClick={() => onChange({ audience: toggle(filters.audience, audience.id) })}
                >
                  {t(audience.key, audience.label)}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title={t('filters.region', 'Region')}>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((region) => (
                <Pill
                  key={region.id}
                  active={filters.regions.includes(region.id)}
                  onClick={() =>
                    onChange({ regions: toggle<RegionId>(filters.regions, region.id) })
                  }
                >
                  {loc(region.name)}
                </Pill>
              ))}
            </div>
          </Group>

          <Group title={t('filters.city', 'City')}>
            <label htmlFor={`${ids}-city`} className="sr-only">
              {t('filters.city', 'City')}
            </label>
            <select
              id={`${ids}-city`}
              value={filters.cityId ?? ''}
              onChange={(event) =>
                onChange({ cityId: event.target.value === '' ? null : event.target.value })
              }
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="">{t('filters.anyCity', 'Any city')}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </Group>

          <Group title={t('filters.unit', 'Unit type')}>
            <label htmlFor={`${ids}-unit`} className="sr-only">
              {t('filters.unit', 'Unit type')}
            </label>
            <select
              id={`${ids}-unit`}
              value={filters.units[0] ?? ''}
              onChange={(event) =>
                onChange({
                  units: event.target.value === '' ? [] : [event.target.value as UnitId],
                })
              }
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="">{t('filters.anyUnit', 'Any unit')}</option>
              {UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {loc(unit.long)}
                </option>
              ))}
            </select>
          </Group>

          <Group title={t('filters.status', 'Status')}>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((status) => {
                const badge = statusBadge(status);
                return (
                  <Pill
                    key={status}
                    active={filters.statuses.includes(status)}
                    onClick={() => onChange({ statuses: toggle(filters.statuses, status) })}
                  >
                    {t(badge.key, badge.label)}
                  </Pill>
                );
              })}
            </div>
          </Group>

          <Slider
            id={`${ids}-saving`}
            label={t('filters.minSaving', 'Minimum saving')}
            value={filters.minSavingPercent}
            valueLabel={
              filters.minSavingPercent === 0
                ? t('filters.any', 'Any')
                : `${filters.minSavingPercent}%+`
            }
            min={0}
            max={SAVING_MAX_PERCENT}
            step={5}
            onChange={(value) => onChange({ minSavingPercent: value })}
          />

          <Slider
            id={`${ids}-radius`}
            label={t('filters.maxRadius', 'Maximum radius')}
            value={filters.maxRadiusKm ?? RADIUS_MAX_KM}
            valueLabel={
              filters.maxRadiusKm === null
                ? t('filters.any', 'Any')
                : `≤ ${filters.maxRadiusKm} km`
            }
            min={10}
            max={RADIUS_MAX_KM}
            step={10}
            onChange={(value) =>
              onChange({ maxRadiusKm: value >= RADIUS_MAX_KM ? null : value })
            }
          />

          <Slider
            id={`${ids}-participants`}
            label={t('filters.minParticipants', 'Minimum participants')}
            value={filters.minParticipants}
            valueLabel={
              filters.minParticipants === 0
                ? t('filters.any', 'Any')
                : `${filters.minParticipants}+`
            }
            min={0}
            max={PARTICIPANTS_MAX}
            step={5}
            onChange={(value) => onChange({ minParticipants: value })}
          />

          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('filters.clearAll', 'Clear all')}
          </button>
        </div>
      </section>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  id,
  label,
  value,
  valueLabel,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-700 tabular-nums">{valueLabel}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-brand-600 w-full"
      />
    </div>
  );
}
