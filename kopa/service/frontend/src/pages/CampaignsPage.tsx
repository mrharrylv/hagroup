import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CampaignCard } from '../components/CampaignCard';
import { Stat } from '../components/ui/Stat';
import { formatNumber } from '../domain/dates';
import { activeFilterCount, applyFilters, isEmptyFilter, sortCampaigns } from '../domain/filters';
import type { SortKey } from '../domain/filters';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import { FilterChips } from './campaigns/FilterChips';
import { FilterRail } from './campaigns/FilterRail';
import { SORT_KEYS, useCampaignFilters } from './campaigns/filterParams';
import { sortLabel } from './campaigns/labels';
import { categoryCounts, regionCounts, summarise } from './campaigns/summary';

const DRAWER_ID = 'campaign-filter-drawer';

export default function CampaignsPage() {
  const { t, lang } = useI18n();
  const { campaigns } = useKopa();
  const { filters, sort, update, setSort, clearAll } = useCampaignFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = useMemo(
    () => sortCampaigns(applyFilters(campaigns, filters), sort),
    [campaigns, filters, sort],
  );

  // Facet counts ignore their own dimension, so a category still shows how many
  // it would add rather than dropping to zero once another one is ticked.
  const categoryFacet = useMemo(
    () => categoryCounts(applyFilters(campaigns, { ...filters, categories: [] })),
    [campaigns, filters],
  );
  const regionFacet = useMemo(
    () => regionCounts(applyFilters(campaigns, { ...filters, regions: [] })),
    [campaigns, filters],
  );

  const summary = useMemo(() => summarise(visible), [visible]);
  const activeCount = activeFilterCount(filters);

  const railProps = {
    filters,
    categoryFacet,
    regionFacet,
    onChange: update,
    onClear: clearAll,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('campaigns.title', 'Browse group buys')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            'campaigns.subtitle',
            'Every open campaign in Latvia. Join one and the price per unit drops for everybody in it.',
          )}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label={t('stats.shown', 'Group buys')}
          value={formatNumber(summary.count, lang)}
          hint={
            campaigns.length > 0 && summary.count === campaigns.length
              ? t('stats.allShown', 'all of them')
              : `${t('stats.of', 'of')} ${formatNumber(campaigns.length, lang)}`
          }
          icon={<span aria-hidden="true">📋</span>}
        />
        <Stat
          label={t('stats.buyers', 'Buyers joined')}
          value={formatNumber(summary.buyers, lang)}
          icon={<span aria-hidden="true">👥</span>}
        />
        <Stat
          label={t('stats.units', 'Units committed')}
          value={formatNumber(summary.units, lang)}
          icon={<span aria-hidden="true">📦</span>}
        />
        <Stat
          label={t('stats.avgSaving', 'Avg. best saving')}
          value={`${formatNumber(summary.averageSavingPercent, lang)}%`}
          hint={t('stats.avgSavingHint', 'at the cheapest tier')}
          icon={<span aria-hidden="true">💶</span>}
        />
      </div>

      <div className="mt-6 flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain">
            <FilterRail {...railProps} idPrefix="rail" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 basis-56">
              <label htmlFor="campaign-search" className="sr-only">
                {t('search.label', 'Search group buys')}
              </label>
              <input
                id="campaign-search"
                type="search"
                value={filters.search}
                onChange={(event) => update({ search: event.target.value })}
                placeholder={t('search.placeholder', 'Search pellets, diesel, fertiliser…')}
                className="focus-visible:outline-brand-600 w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-2"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-slate-400"
              >
                🔍
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              aria-expanded={drawerOpen}
              aria-controls={DRAWER_ID}
              className="focus-visible:outline-brand-600 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 lg:hidden"
            >
              {t('filter.filters', 'Filters')}
              {activeCount > 0 && (
                <span className="bg-brand-50 text-brand-800 ml-1.5 rounded-full px-1.5 py-0.5 text-xs">
                  {activeCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="campaign-sort" className="sr-only">
                {t('sort.label', 'Sort by')}
              </label>
              <select
                id="campaign-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="focus-visible:outline-brand-600 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 focus-visible:outline-2"
              >
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {sortLabel(key, t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div id={DRAWER_ID} hidden={!drawerOpen} className="mt-3 lg:hidden">
            {drawerOpen && <FilterRail {...railProps} idPrefix="drawer" />}
          </div>

          <FilterChips filters={filters} onChange={update} onClear={clearAll} />

          <p className="mt-3 text-sm text-slate-500" aria-live="polite">
            <span className="font-medium text-slate-800">{formatNumber(summary.count, lang)}</span>{' '}
            {summary.count === 1
              ? t('campaigns.countOne', 'group buy')
              : t('campaigns.countMany', 'group buys')}
          </p>

          {visible.length === 0 ? (
            <EmptyState onClear={clearAll} filtered={!isEmptyFilter(filters)} />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onClear, filtered }: { onClear: () => void; filtered: boolean }) {
  const { t } = useI18n();

  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <div className="text-3xl" aria-hidden="true">
        🫙
      </div>
      <h2 className="mt-2 text-base font-semibold text-slate-900">
        {filtered
          ? t('campaigns.emptyTitle', 'Nothing matches those filters')
          : t('campaigns.noneYet', 'No group buys yet')}
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
        {filtered
          ? t(
              'campaigns.emptyBody',
              'Try a wider radius, fewer categories, or a different search term. Or start the group buy yourself and let neighbours join it.',
            )
          : t(
              'campaigns.noneYetBody',
              'Nothing has been opened in your area yet. Start the first one and let neighbours join it.',
            )}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {filtered && (
          <button
            type="button"
            onClick={onClear}
            className="focus-visible:outline-brand-600 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2"
          >
            {t('campaigns.clearFilters', 'Clear all filters')}
          </button>
        )}
        <Link
          to="/start"
          className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-600 rounded-lg px-3 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t('campaigns.startOne', 'Start a group buy')}
        </Link>
      </div>
    </div>
  );
}
