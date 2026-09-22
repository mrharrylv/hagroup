import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { REGIONS } from '../../data/regions';
import { useI18n } from '../../i18n/useI18n';
import { regionBubbleIcon } from './pin';
import type { Region, RegionId } from '../../domain/types';

/**
 * Zoomed out past the whole country, thirty individual pins are noise. One
 * bubble per region, sized by how many group buys are inside it, is the
 * readable answer — and clicking one is how you drill into a region.
 */
export function RegionBubbles({
  counts,
  activeRegions,
  onPick,
}: {
  counts: ReadonlyMap<RegionId, number>;
  activeRegions: readonly RegionId[];
  onPick: (region: Region) => void;
}) {
  const { loc } = useI18n();

  // A region with nothing in it under the current filters gets no bubble at
  // all — an empty "0" badge floating over Kurzeme reads as a broken map
  // rather than as an answer.
  const bubbles = useMemo(
    () =>
      REGIONS.map((region) => ({ region, count: counts.get(region.id) ?? 0 }))
        .filter(({ count }) => count > 0)
        .map(({ region, count }) => ({
          region,
          icon: regionBubbleIcon({
            name: loc(region.name),
            count,
            active: activeRegions.includes(region.id),
          }),
        })),
    [counts, activeRegions, loc],
  );

  return (
    <>
      {bubbles.map(({ region, icon }) => (
        <Marker
          key={region.id}
          position={[region.lat, region.lng]}
          icon={icon}
          title={loc(region.name)}
          alt={loc(region.name)}
          riseOnHover
          eventHandlers={{ click: () => onPick(region) }}
        />
      ))}
    </>
  );
}
