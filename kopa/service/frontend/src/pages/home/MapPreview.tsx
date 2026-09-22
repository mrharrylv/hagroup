import type { LatLngBoundsExpression } from 'leaflet';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { categoryColour } from '../../components/CategoryIcon';
import { cityById } from '../../data/cities';
import { LATVIA_BOUNDS } from '../../data/regions';
import { formatNumber } from '../../domain/dates';
import type { Campaign } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { Section } from './Section';
import { activeCampaigns, topCities } from './stats';
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../../data/tiles';

/** Leaflet wants a mutable literal; the shared constant is deeply readonly. */
const HOME_BOUNDS: LatLngBoundsExpression = [
  [LATVIA_BOUNDS[0][0], LATVIA_BOUNDS[0][1]],
  [LATVIA_BOUNDS[1][0], LATVIA_BOUNDS[1][1]],
];

/** A pin Leaflet can actually place. Bad coordinates would throw on `setLatLng`. */
function hasPin(campaign: Campaign): boolean {
  return Number.isFinite(campaign.lat) && Number.isFinite(campaign.lng);
}

export function MapPreview({ campaigns }: { campaigns: readonly Campaign[] }) {
  const { lang, t } = useI18n();
  const live = activeCampaigns(campaigns);
  const pins = live.filter(hasPin);
  const cities = topCities(live).slice(0, 5);

  return (
    <Section
      title={t('home.map.title', 'Where the demand is')}
      lead={t('home.map.lead', 'Every open group buy in Latvia, on one map.')}
    >
      <div className="relative">
        <div
          role="group"
          aria-label={t('home.map.aria', 'Map of active group buys in Latvia')}
          className="h-[420px] overflow-hidden rounded-2xl border border-slate-200"
        >
          {/*
            A preview, not a tool: every gesture is off so a 420 px map cannot
            swallow a phone's vertical scroll. "Open the full map" is the way in.
          */}
          <MapContainer
            bounds={HOME_BOUNDS}
            scrollWheelZoom={false}
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            keyboard={false}
            zoomControl={false}
            className="h-full w-full"
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
            {pins.map((campaign) => (
              <CircleMarker
                key={campaign.id}
                center={[campaign.lat, campaign.lng]}
                radius={5}
                pathOptions={{
                  color: '#ffffff',
                  weight: 1.5,
                  fillColor: categoryColour(campaign.category),
                  fillOpacity: 0.9,
                  interactive: false,
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/*
          Floating over the map from `sm:` up. At 375 px a 224 px panel would
          cover two thirds of a 343 px map, so on a phone it sits below it.
        */}
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 sm:absolute sm:top-3 sm:right-3 sm:z-[500] sm:mt-0 sm:w-56 sm:bg-white/95 sm:shadow-sm">
          <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t('home.map.topCities', 'Busiest towns')}
          </h3>
          {cities.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">
              {t('home.map.empty', 'No open group buys on the map yet.')}
            </p>
          ) : (
            <ul className="mt-2 space-y-1">
              {cities.map((city) => (
                <li key={city.id}>
                  <Link
                    to={`/map?city=${city.id}`}
                    className="hover:bg-brand-50 focus-visible:outline-brand-700 flex items-center justify-between rounded px-1.5 py-1 text-sm text-slate-700 focus-visible:outline-2"
                  >
                    <span className="truncate">{cityById(city.id)?.name ?? city.id}</span>
                    <span className="ml-2 text-xs text-slate-500 tabular-nums">
                      {formatNumber(city.count, lang)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link
        to="/map"
        className="border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100 focus-visible:outline-brand-700 mt-3 flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('home.map.open', 'Open the full map')}
      </Link>
    </Section>
  );
}
