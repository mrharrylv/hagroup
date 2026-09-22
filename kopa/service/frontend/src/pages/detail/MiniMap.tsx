import { useMemo } from 'react';
import { divIcon } from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { categoryColour } from '../../components/CategoryIcon';
import { cityById } from '../../data/cities';
import { categoryById } from '../../data/taxonomy';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign } from '../../domain/types';
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../../data/tiles';


/** The map box is h-56, i.e. 224 CSS pixels tall. */
const MAP_HEIGHT_PX = 224;
/** Fit the whole catchment circle with a fifth of the box left as margin. */
const FIT_FACTOR = 2.4;

/**
 * Pick the zoom at which the catchment circle fills most of the box without
 * spilling out of it. Leaflet's ground resolution is
 * `156543.03 * cos(latitude) / 2^zoom` metres per pixel.
 */
function zoomForRadius(radiusKm: number, lat: number): number {
  const metresPerPixelAtZoom0 = 156543.03392 * Math.cos((lat * Math.PI) / 180);
  const wanted = (radiusKm * 1000 * FIT_FACTOR) / MAP_HEIGHT_PX;
  if (wanted <= 0) return 11;

  const zoom = Math.log2(metresPerPixelAtZoom0 / wanted);
  return Math.max(5, Math.min(13, Math.floor(zoom)));
}

/** A still picture of where the campaign sits — not a map you can drive. */
export function MiniMap({ campaign }: { campaign: Campaign }) {
  const { t } = useI18n();
  const colour = categoryColour(campaign.category);
  const city = cityById(campaign.cityId);
  const centre = useMemo(
    () => ({ lat: campaign.lat, lng: campaign.lng }),
    [campaign.lat, campaign.lng],
  );

  const icon = useMemo(() => {
    const emoji = categoryById(campaign.category)?.icon ?? '📦';
    return divIcon({
      className: 'kopa-pin',
      html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#fff;border:2px solid ${colour};box-shadow:0 1px 3px rgb(15 23 42 / 25%);font-size:16px">${emoji}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, [campaign.category, colour]);

  return (
    <div>
      <div className="h-56 overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={centre}
          zoom={zoomForRadius(campaign.radiusKm, campaign.lat)}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          className="h-full w-full"
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
          <Circle
            center={centre}
            radius={campaign.radiusKm * 1000}
            pathOptions={{ color: colour, weight: 1.5, fillColor: colour, fillOpacity: 0.12 }}
          />
          <Marker position={centre} icon={icon} />
        </MapContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-slate-500">
          {t('detail.catchment', 'Anyone within')} {campaign.radiusKm} km{' '}
          {t('detail.catchmentOf', 'of')} {city?.name ?? campaign.cityId}{' '}
          {t('detail.catchmentCan', 'can join this order.')}
        </p>
        <Link
          to={`/map?c=${campaign.slug}`}
          className="text-brand-700 hover:text-brand-800 font-medium underline-offset-2 hover:underline"
        >
          {t('detail.seeOnMap', 'See on the full map')} →
        </Link>
      </div>
    </div>
  );
}
