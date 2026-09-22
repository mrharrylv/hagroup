import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { categoryColour } from '../components/CategoryIcon';
import { JoinModal } from '../components/JoinModal';
import { cityById } from '../data/cities';
import { LATVIA_BOUNDS, regionById } from '../data/regions';
import { activeFilterCount, applyFilters, searchHighlightIds } from '../domain/filters';
import { nearest } from '../domain/geo';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import { CampaignPins } from './map/CampaignPins';
import { FIT_OPTIONS, FIT_PADDING, toBoundsLiteral } from './map/bounds';
import { MapFilterPanel } from './map/MapFilterPanel';
import { MapOverlayBar } from './map/MapOverlayBar';
import { MapSidePanel } from './map/MapSidePanel';
import { RegionBar, ZoomControls } from './map/MapControls';
import { RegionBubbles } from './map/RegionBubbles';
import { AGGREGATE_BELOW_ZOOM, shouldAggregate } from './map/aggregation';
import { useMapFilters } from './map/useMapFilters';
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import type { Campaign, CategoryId, Region, RegionId } from '../domain/types';
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../data/tiles';

/** Zoom a fly-to-a-pin lands on, so the pin is never hidden inside a bubble. */
const PIN_ZOOM = 9;

/** Tailwind's `lg`: below this the side panel is a bottom sheet, not a rail. */
const SHEET_BREAKPOINT_PX = 1024;

/** How far down the centre moves so a flown-to pin clears that sheet. */
const SHEET_OFFSET_RATIO = 0.2;

export default function MapPage() {
  const { campaigns } = useKopa();
  const { t } = useI18n();
  const { filters, setFilters, clearAll, toggleCategory, selectedSlug, selectSlug } =
    useMapFilters();

  const [map, setMap] = useState<LeafletMap | null>(null);
  const [zoom, setZoom] = useState(7);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [joining, setJoining] = useState(false);

  const latviaBounds = useMemo(() => toBoundsLiteral(LATVIA_BOUNDS), []);
  const searchActive = filters.search.trim() !== '';

  const aggregate = shouldAggregate(zoom, searchActive);

  /**
   * The search box highlights, it never hides — so the pins on the map are
   * everything that survives the *other* filters, and the query only decides
   * which of them light up.
   */
  const visible = useMemo(
    () => applyFilters(campaigns, { ...filters, search: '' }),
    [campaigns, filters],
  );

  const highlightIds = useMemo(
    () => searchHighlightIds(visible, filters.search),
    [visible, filters.search],
  );

  /** Chip counts ignore the category filter, so a chip never counts itself to zero. */
  const categoryCounts = useMemo(() => {
    const base = applyFilters(campaigns, { ...filters, search: '', categories: [] });
    return countBy(base, (campaign) => campaign.category);
  }, [campaigns, filters]);

  /** Bubbles show what is actually on the map, filtered region included. */
  const regionCounts = useMemo(
    () => countBy(visible, (campaign) => campaign.regionId),
    [visible],
  );

  /**
   * The region bar is navigation, not data: it ignores the region filter, so
   * drilling into Vidzeme does not report the other four regions as empty.
   */
  const regionBarCounts = useMemo(() => {
    const base = applyFilters(campaigns, { ...filters, search: '', regions: [] });
    return countBy(base, (campaign) => campaign.regionId);
  }, [campaigns, filters]);

  const selected = useMemo(
    () => campaigns.find((campaign) => campaign.slug === selectedSlug) ?? null,
    [campaigns, selectedSlug],
  );

  const nearby = useMemo(() => {
    if (selected === null) return [];
    return nearest(campaigns, { lat: selected.lat, lng: selected.lng }, {
      excludeId: selected.id,
      limit: 3,
    });
  }, [campaigns, selected]);

  /**
   * Framing one region. Fitting its bounds is the obvious move and is wrong on
   * a narrow screen: Kurzeme fits at zoom 7 on a phone, which is *below* the
   * aggregation threshold, so picking a region left the user staring at a
   * single bubble and a "zoom in to see individual group buys" hint. When the
   * fit would land short, centre on the region and take the threshold zoom
   * instead, so a region pick always ends on pins.
   */
  const frameRegion = useCallback(
    (region: Region, animate: boolean) => {
      if (map === null) return;

      const bounds = toBoundsLiteral(region.bounds);
      if (map.getBoundsZoom(bounds, false, FIT_PADDING) >= AGGREGATE_BELOW_ZOOM) {
        if (animate) map.flyToBounds(bounds, { ...FIT_OPTIONS, duration: 0.8 });
        else map.fitBounds(bounds, FIT_OPTIONS);
        return;
      }

      const centre: LatLngTuple = [region.lat, region.lng];
      if (animate) map.flyTo(centre, AGGREGATE_BELOW_ZOOM, { duration: 0.8 });
      else map.setView(centre, AGGREGATE_BELOW_ZOOM);
    },
    [map],
  );

  // Fly to whatever pin is selected, including one arriving from a shared ?c= link.
  const flownToRef = useRef<string | null>(null);
  useEffect(() => {
    if (selected === null) {
      flownToRef.current = null;
      return;
    }
    if (map === null || flownToRef.current === selected.id) return;

    flownToRef.current = selected.id;
    const targetZoom = Math.max(map.getZoom(), PIN_ZOOM);

    // Below lg the panel is a bottom sheet covering up to 60vh, so centring on
    // the pin would fly it straight under the sheet. Shifting the centre down
    // in screen space lifts the pin into the strip that is still visible.
    const size = map.getSize();
    const drop: [number, number] = [0, size.x < SHEET_BREAKPOINT_PX ? size.y * SHEET_OFFSET_RATIO : 0];
    const point = map.project([selected.lat, selected.lng], targetZoom).add(drop);

    map.flyTo(map.unproject(point, targetZoom), targetZoom, { duration: 0.7 });
  }, [map, selected]);

  /**
   * Leaflet only listens for window resizes, so a container that changes size
   * on its own — the sidebar opening, a devtools viewport change — leaves the
   * canvas painted at the old size until something else nudges it.
   */
  useEffect(() => {
    if (map === null) return;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  /** Escape closes whatever is open, innermost first. The join modal owns its own. */
  useEffect(() => {
    if (joining) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (filtersOpen) setFiltersOpen(false);
      else if (selectedSlug !== null) selectSlug(null);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [joining, filtersOpen, selectedSlug, selectSlug]);

  /**
   * Frame the map once it is really on screen. The creation-time fit runs
   * before the container has its final size and can land a whole zoom level
   * out, and a link like /map?city=jelgava should open on Jelgava anyway.
   */
  const focusedRef = useRef(false);
  useEffect(() => {
    if (map === null || focusedRef.current) return;
    focusedRef.current = true;
    map.invalidateSize();
    if (selectedSlug !== null) return;

    const city = filters.cityId === null ? undefined : cityById(filters.cityId);
    if (city !== undefined) {
      map.setView([city.lat, city.lng], 10);
      return;
    }

    const region = filters.regions.length === 1 ? regionById(filters.regions[0]) : undefined;
    if (region === undefined) map.fitBounds(latviaBounds, FIT_OPTIONS);
    else frameRegion(region, false);
  }, [map, filters.cityId, filters.regions, selectedSlug, latviaBounds, frameRegion]);

  const focusRegion = useCallback(
    (region: Region | null) => {
      if (region === null) {
        setFilters({ regions: [] });
        map?.flyToBounds(latviaBounds, { ...FIT_OPTIONS, duration: 0.8 });
        return;
      }

      setFilters({ regions: [region.id] });
      frameRegion(region, true);
    },
    [map, setFilters, latviaBounds, frameRegion],
  );

  const selectCampaign = useCallback(
    (campaign: Campaign) => {
      selectSlug(campaign.slug);
      setFiltersOpen(false);
    },
    [selectSlug],
  );

  const closePanel = useCallback(() => {
    selectSlug(null);
    setJoining(false);
  }, [selectSlug]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <MapContainer
        bounds={latviaBounds}
        boundsOptions={FIT_OPTIONS}
        minZoom={6}
        maxZoom={14}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <MapBridge onMap={setMap} onZoom={setZoom} onBackgroundClick={closePanel} />

        {aggregate ? (
          <RegionBubbles
            counts={regionCounts}
            activeRegions={filters.regions}
            onPick={focusRegion}
          />
        ) : (
          <CampaignPins
            campaigns={visible}
            highlightIds={highlightIds}
            searchActive={searchActive}
            selectedId={selected?.id ?? null}
            zoom={zoom}
            onSelect={selectCampaign}
          />
        )}

        {selected !== null && (
          <Circle
            center={[selected.lat, selected.lng]}
            radius={selected.radiusKm * 1000}
            pathOptions={{
              color: categoryColour(selected.category),
              fillColor: categoryColour(selected.category),
              fillOpacity: 0.08,
              opacity: 0.6,
              weight: 1.5,
            }}
          />
        )}
      </MapContainer>

      <MapOverlayBar
        search={filters.search}
        onSearch={(value) => setFilters({ search: value })}
        matchCount={searchActive ? highlightIds.size : visible.length}
        totalCount={visible.length}
        filterCount={activeFilterCount(filters)}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        categoryCounts={categoryCounts}
        activeCategories={filters.categories}
        onToggleCategory={toggleCategory}
      />

      {filtersOpen && (
        <MapFilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={clearAll}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      <RegionBar
        activeRegions={filters.regions}
        counts={regionBarCounts}
        showZoomHint={aggregate}
        hiddenOnSmall={selected !== null}
        onPick={focusRegion}
      />

      <ZoomControls
        onZoomIn={() => map?.zoomIn()}
        onZoomOut={() => map?.zoomOut()}
        onRecentre={() => map?.flyToBounds(latviaBounds, { ...FIT_OPTIONS, duration: 0.8 })}
        hiddenOnSmall={selected !== null}
      />

      {visible.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[550] flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-5 text-center shadow-xl backdrop-blur">
            <p className="text-2xl" aria-hidden="true">
              🗺️
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              {t('map.emptyTitle', 'No group buys match these filters')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('map.emptyBody', 'Widen the radius, drop a filter, or look at all of Latvia.')}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="bg-brand-600 hover:bg-brand-700 mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              {t('filters.clearAll', 'Clear all')}
            </button>
          </div>
        </div>
      )}

      {selected !== null && (
        <MapSidePanel
          campaign={selected}
          nearby={nearby}
          onClose={closePanel}
          onJoin={() => setJoining(true)}
          onSelect={selectCampaign}
        />
      )}

      {/* The modal is a page-level child: nested inside the panel its z-index
          would be trapped under the site header's stacking context. */}
      {joining && selected !== null && (
        <JoinModal campaign={selected} onClose={() => setJoining(false)} />
      )}
    </div>
  );
}

/**
 * Anything that calls useMap has to live inside MapContainer, so this child
 * hands the Leaflet instance and the live zoom back out to the page, letting
 * every floating control stay a plain sibling of the map.
 */
function MapBridge({
  onMap,
  onZoom,
  onBackgroundClick,
}: {
  onMap: (map: LeafletMap | null) => void;
  onZoom: (zoom: number) => void;
  /** Leaflet keeps marker clicks off the map, so this only fires on the basemap. */
  onBackgroundClick: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    onMap(map);
    onZoom(map.getZoom());
    return () => onMap(null);
  }, [map, onMap, onZoom]);

  /**
   * `zoomend` alone is not enough. A programmatic `setView` or `flyToBounds`
   * — which is how /map?city=jelgava and every region button move the map —
   * can settle without React ever hearing about it, and the page then renders
   * region bubbles over a map that is already zoomed in on one town. Listening
   * to the settle events as well keeps the rendered zoom and the real zoom
   * from drifting apart.
   */
  useMapEvents({
    load: () => onZoom(map.getZoom()),
    zoomend: () => onZoom(map.getZoom()),
    moveend: () => onZoom(map.getZoom()),
    viewreset: () => onZoom(map.getZoom()),
    resize: () => onZoom(map.getZoom()),
    click: () => onBackgroundClick(),
  });

  return null;
}

function countBy<K extends CategoryId | RegionId>(
  campaigns: readonly Campaign[],
  key: (campaign: Campaign) => K,
): ReadonlyMap<K, number> {
  const counts = new Map<K, number>();
  for (const campaign of campaigns) {
    const value = key(campaign);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}
