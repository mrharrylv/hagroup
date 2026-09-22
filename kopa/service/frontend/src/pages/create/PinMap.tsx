import { useEffect, useMemo } from 'react';
import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { cityById } from '../../data/cities';
import { categoryById } from '../../data/taxonomy';
import type { CategoryId } from '../../domain/types';
import { TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from '../../data/tiles';

const CITY_ZOOM = 11;

/**
 * The pin picker for the "Where" step: click anywhere to drop the pin, drag it
 * to fine-tune, and the catchment circle follows the radius selector live.
 *
 * Leaflet's bundled default marker image does not survive bundling, so the pin
 * is a `divIcon` carrying the category emoji — which also keeps it consistent
 * with the category colours used everywhere else.
 */
export function PinMap({
  lat,
  lng,
  radiusKm,
  category,
  cityId,
  onPick,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
  category: CategoryId;
  cityId: string;
  onPick: (lat: number, lng: number) => void;
}) {
  const icon = useMemo(() => {
    const meta = categoryById(category);
    const colour = meta?.colour ?? '#0d9488';
    return divIcon({
      className: 'kopa-pin',
      html:
        '<div style="display:flex;align-items:center;justify-content:center;width:34px;' +
        `height:34px;border-radius:9999px;background:${colour};border:2px solid #fff;` +
        'box-shadow:0 1px 5px rgb(15 23 42 / 40%);font-size:16px;line-height:1;">' +
        `${meta?.icon ?? '📦'}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, [category]);

  return (
    <MapContainer center={[lat, lng]} zoom={CITY_ZOOM} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
      <ClickToPin onPick={onPick} />
      <RecentreOnCity cityId={cityId} />
      <Circle
        center={[lat, lng]}
        radius={Math.max(radiusKm, 1) * 1000}
        pathOptions={{ color: '#0d9488', weight: 2, fillColor: '#14b8a6', fillOpacity: 0.12 }}
      />
      <Marker
        position={[lat, lng]}
        draggable
        icon={icon}
        eventHandlers={{
          dragend(event) {
            const position = (event.target as LeafletMarker).getLatLng();
            onPick(position.lat, position.lng);
          },
        }}
      />
    </MapContainer>
  );
}

function ClickToPin({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/** Only the city choice moves the viewport; dropping a pin must not jump it. */
function RecentreOnCity({ cityId }: { cityId: string }) {
  const map = useMap();

  useEffect(() => {
    const city = cityById(cityId);
    if (city === undefined) return;
    map.setView([city.lat, city.lng], CITY_ZOOM);
  }, [cityId, map]);

  return null;
}
