import type { ReactNode } from 'react';
import { citiesInRegion } from '../../data/cities';
import { REGIONS } from '../../data/regions';
import { CATEGORIES, UNITS } from '../../data/taxonomy';
import { activeFilterCount } from '../../domain/filters';
import type { FilterState } from '../../domain/filters';
import { useI18n } from '../../i18n/useI18n';
import type {
  AudienceId,
  CampaignStatus,
  CategoryId,
  RegionId,
  UnitId,
} from '../../domain/types';
import { toggleValue } from './filterParams';
import {
  AUDIENCES,
  RADIUS_OPTIONS,
  STATUSES,
  audienceLabel,
  radiusLabel,
  statusLabel,
} from './labels';

const SAVING_STEPS = { min: 0, max: 50, step: 5 } as const;

const SELECT_CLASS =
  'focus-visible:outline-brand-600 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus-visible:outline-2';

export function FilterRail({
  filters,
  categoryFacet,
  regionFacet,
  onChange,
  onClear,
  idPrefix,
}: {
  filters: FilterState;
  categoryFacet: ReadonlyMap<CategoryId, number>;
  regionFacet: ReadonlyMap<RegionId, number>;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  /** Keeps input ids unique when the rail and the mobile drawer are both mounted. */
  idPrefix: string;
}) {
  const { t, loc } = useI18n();
  const id = (suffix: string) => `${idPrefix}-${suffix}`;
  const activeCount = activeFilterCount(filters);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {t('filter.filters', 'Filters')}
          {activeCount > 0 && (
            <span className="bg-brand-50 text-brand-800 ml-2 rounded-full px-1.5 py-0.5 text-xs">
              {activeCount}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0 && filters.search === ''}
          className="focus-visible:outline-brand-600 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('cta.clear', 'Clear all')}
        </button>
      </div>

      <Section title={t('filter.category', 'Category')}>
        <ul className="space-y-0.5">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <CheckRow
                id={id(`cat-${category.id}`)}
                checked={filters.categories.includes(category.id)}
                onToggle={() => onChange({ categories: toggleValue(filters.categories, category.id) })}
                icon={category.icon}
                label={loc(category.name)}
                count={categoryFacet.get(category.id) ?? 0}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('filter.region', 'Region')}>
        <ul className="space-y-0.5">
          {REGIONS.map((region) => (
            <li key={region.id}>
              <CheckRow
                id={id(`reg-${region.id}`)}
                checked={filters.regions.includes(region.id)}
                onToggle={() => onChange({ regions: toggleValue(filters.regions, region.id) })}
                label={loc(region.name)}
                count={regionFacet.get(region.id) ?? 0}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('filter.city', 'City')}>
        <label htmlFor={id('city')} className="sr-only">
          {t('filter.city', 'City')}
        </label>
        <select
          id={id('city')}
          value={filters.cityId ?? ''}
          onChange={(event) => onChange({ cityId: event.target.value === '' ? null : event.target.value })}
          className={SELECT_CLASS}
        >
          <option value="">{t('filter.anyCity', 'Any city')}</option>
          {REGIONS.map((region) => (
            <optgroup key={region.id} label={loc(region.name)}>
              {citiesInRegion(region.id).map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Section>

      <Section title={t('filter.audience', 'Open to')}>
        <ul className="space-y-0.5">
          {AUDIENCES.map((audience: AudienceId) => (
            <li key={audience}>
              <CheckRow
                id={id(`aud-${audience}`)}
                checked={filters.audience.includes(audience)}
                onToggle={() => onChange({ audience: toggleValue(filters.audience, audience) })}
                label={audienceLabel(audience, t)}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('filter.unit', 'Unit')}>
        <label htmlFor={id('unit')} className="sr-only">
          {t('filter.unit', 'Unit')}
        </label>
        <select
          id={id('unit')}
          value={filters.units[0] ?? ''}
          onChange={(event) =>
            onChange({ units: event.target.value === '' ? [] : [event.target.value as UnitId] })
          }
          className={SELECT_CLASS}
        >
          <option value="">{t('filter.anyUnit', 'Any unit')}</option>
          {UNITS.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {loc(unit.long)}
            </option>
          ))}
        </select>
      </Section>

      <Section title={t('filter.status', 'Status')}>
        <ul className="space-y-0.5">
          {STATUSES.map((status: CampaignStatus) => (
            <li key={status}>
              <CheckRow
                id={id(`st-${status}`)}
                checked={filters.statuses.includes(status)}
                onToggle={() => onChange({ statuses: toggleValue(filters.statuses, status) })}
                label={statusLabel(status, t)}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('filter.saving', 'Minimum saving')}>
        <div className="flex items-center gap-3">
          <input
            id={id('saving')}
            type="range"
            min={SAVING_STEPS.min}
            max={SAVING_STEPS.max}
            step={SAVING_STEPS.step}
            value={filters.minSavingPercent}
            onChange={(event) => onChange({ minSavingPercent: Number(event.target.value) })}
            className="accent-brand-600 h-1 flex-1"
          />
          <output htmlFor={id('saving')} className="w-12 text-right text-sm text-slate-700 tabular-nums">
            {filters.minSavingPercent === 0 ? t('filter.all', 'Any') : `${filters.minSavingPercent}%`}
          </output>
        </div>
      </Section>

      <Section title={t('filter.radius', 'Max delivery radius')}>
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_OPTIONS.map((km) => {
            const active = filters.maxRadiusKm === km;
            return (
              <button
                key={km ?? 'any'}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ maxRadiusKm: km })}
                className={[
                  'focus-visible:outline-brand-600 rounded-lg border px-2 py-1 text-xs font-medium focus-visible:outline-2',
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                {radiusLabel(km, t)}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('filter.participants', 'Minimum buyers joined')}>
        <label htmlFor={id('buyers')} className="sr-only">
          {t('filter.participants', 'Minimum buyers joined')}
        </label>
        <input
          id={id('buyers')}
          type="number"
          min={0}
          step={1}
          value={filters.minParticipants}
          onChange={(event) =>
            onChange({ minParticipants: clampCount(Number(event.target.value)) })
          }
          className={SELECT_CLASS}
        />
      </Section>
    </div>
  );
}

function clampCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 px-3 py-3">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{title}</h3>
      {children}
    </section>
  );
}

function CheckRow({
  id,
  checked,
  onToggle,
  label,
  icon,
  count,
}: {
  id: string;
  checked: boolean;
  onToggle: () => void;
  label: string;
  icon?: string;
  count?: number;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-slate-50"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-brand-600 focus-visible:outline-brand-600 h-4 w-4 focus-visible:outline-2"
      />
      {icon !== undefined && <span aria-hidden="true">{icon}</span>}
      <span title={label} className="min-w-0 flex-1 truncate text-slate-700">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-slate-400 tabular-nums">{count}</span>
      )}
    </label>
  );
}
