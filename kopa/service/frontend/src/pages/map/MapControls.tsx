import type { ReactNode } from 'react';
import { REGIONS } from '../../data/regions';
import { useI18n } from '../../i18n/useI18n';
import type { Region, RegionId } from '../../domain/types';

/**
 * Bottom-left: the region drill-down. Clicking a region flies the map to its
 * bounds and filters to it, which is the "zoom into a region" half of the map.
 */
export function RegionBar({
  activeRegions,
  counts,
  showZoomHint,
  hiddenOnSmall,
  onPick,
}: {
  activeRegions: readonly RegionId[];
  counts: ReadonlyMap<RegionId, number>;
  /** True while the map is aggregated, i.e. showing region bubbles not pins. */
  showZoomHint: boolean;
  /** The bottom sheet owns the bottom of a phone screen when a pin is open. */
  hiddenOnSmall: boolean;
  onPick: (region: Region | null) => void;
}) {
  const { t, loc } = useI18n();
  const all = activeRegions.length === 0;

  return (
    <div
      className={`pointer-events-none absolute bottom-3 left-3 z-[600] max-w-[calc(100%-4.5rem)] flex-col items-start gap-2 lg:max-w-[calc(100%-1.5rem)] ${
        hiddenOnSmall ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {showZoomHint && (
        <p className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white shadow">
          {t('map.zoomHint', 'Zoom in, or pick a region, to see individual group buys')}
        </p>
      )}

      <div className="pointer-events-auto flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur">
        <RegionButton active={all} onClick={() => onPick(null)}>
          {t('map.allLatvia', 'All Latvia')}
        </RegionButton>
        {REGIONS.map((region) => (
          <RegionButton
            key={region.id}
            active={activeRegions.includes(region.id)}
            onClick={() => onPick(region)}
          >
            {loc(region.name)}
            <span className="ml-1 text-[10px] opacity-70 tabular-nums">
              {counts.get(region.id) ?? 0}
            </span>
          </RegionButton>
        ))}
      </div>
    </div>
  );
}

function RegionButton({
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
      className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-brand-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Bottom-right: the only zoom control on the page — Leaflet's own is turned
 * off so the map never shows two of them. Sits above the attribution strip.
 */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onRecentre,
  hiddenOnSmall,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecentre: () => void;
  hiddenOnSmall: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={`pointer-events-auto absolute right-3 bottom-10 z-[600] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur ${
        hiddenOnSmall ? 'hidden lg:flex' : 'flex'
      }`}
    >
      <ZoomButton label={t('map.zoomIn', 'Zoom in')} onClick={onZoomIn}>
        +
      </ZoomButton>
      <ZoomButton label={t('map.zoomOut', 'Zoom out')} onClick={onZoomOut}>
        −
      </ZoomButton>
      <ZoomButton label={t('map.recentre', 'Show all of Latvia')} onClick={onRecentre}>
        ⌖
      </ZoomButton>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-9 w-9 border-b border-slate-200 text-base leading-none text-slate-700 last:border-b-0 hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
