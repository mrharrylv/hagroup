import { useId } from 'react';
import { CATEGORIES } from '../../data/taxonomy';
import { useI18n } from '../../i18n/useI18n';
import type { CategoryId } from '../../domain/types';

/**
 * The floating top bar: search, live hit count, and the Filters toggle, with
 * the category chip row underneath. Nothing here sits in a strip beside the
 * map — it all floats over it, and the gaps between controls stay draggable.
 */
export function MapOverlayBar({
  search,
  onSearch,
  matchCount,
  totalCount,
  filterCount,
  filtersOpen,
  onToggleFilters,
  categoryCounts,
  activeCategories,
  onToggleCategory,
}: {
  search: string;
  onSearch: (value: string) => void;
  /** Campaigns the search box matched, out of those the filters left on the map. */
  matchCount: number;
  totalCount: number;
  filterCount: number;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  categoryCounts: ReadonlyMap<CategoryId, number>;
  activeCategories: readonly CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
}) {
  const { t, loc } = useI18n();
  const searchId = useId();
  const searching = search.trim() !== '';

  /** Live count: hits out of what is on the map while searching, the map total otherwise. */
  const hits = searching
    ? `${matchCount} ${t('search.of', 'of')} ${totalCount} ${t('search.match', 'match')}`
    : `${totalCount} ${t('search.onMap', 'on the map')}`;

  return (
    <div className="pointer-events-none absolute top-3 right-3 left-3 z-[600] mx-auto flex max-w-4xl flex-col gap-2">
      <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <label htmlFor={searchId} className="sr-only">
              {t('search.label', 'Search group buys')}
            </label>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            >
              🔎
            </span>
            <input
              id={searchId}
              type="text"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={t('search.placeholder', 'Search: diesel, pellets, firewood...')}
              autoComplete="off"
              className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-slate-300 py-2 pr-9 pl-9 text-sm focus:ring-1 focus:outline-none"
            />
            {searching && (
              <button
                type="button"
                onClick={() => onSearch('')}
                aria-label={t('search.clear', 'Clear search')}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          <p
            aria-live="polite"
            className="hidden shrink-0 text-xs font-medium text-slate-500 tabular-nums sm:block"
          >
            {hits}
          </p>

          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              filtersOpen || filterCount > 0
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span aria-hidden="true">⚙︎</span>
            <span className="hidden sm:inline">{t('filters.title', 'Filters')}</span>
            {filterCount > 0 && (
              <span className="bg-brand-600 rounded-full px-1.5 text-xs font-semibold text-white tabular-nums">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {searching && (
          <p className="px-1 pt-1 text-xs font-medium text-slate-500 tabular-nums sm:hidden">
            {hits}
          </p>
        )}
      </div>

      <div className="pointer-events-auto flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category.id}
            id={category.id}
            icon={category.icon}
            name={loc(category.name)}
            colour={category.colour}
            count={categoryCounts.get(category.id) ?? 0}
            active={activeCategories.includes(category.id)}
            onToggle={onToggleCategory}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  id,
  icon,
  name,
  colour,
  count,
  active,
  onToggle,
}: {
  id: CategoryId;
  icon: string;
  name: string;
  colour: string;
  count: number;
  active: boolean;
  onToggle: (id: CategoryId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-pressed={active}
      style={active ? { backgroundColor: colour, borderColor: colour } : undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm transition ${
        active
          ? 'text-white'
          : 'border-slate-200 bg-white/95 text-slate-700 backdrop-blur hover:border-slate-300'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="whitespace-nowrap">{name}</span>
      <span className={active ? 'text-white/80 tabular-nums' : 'text-slate-400 tabular-nums'}>
        {count}
      </span>
    </button>
  );
}
