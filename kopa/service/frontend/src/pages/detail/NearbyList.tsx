import { CampaignCard } from '../../components/CampaignCard';
import { formatNumber } from '../../domain/dates';
import { nearest } from '../../domain/geo';
import { useI18n } from '../../i18n/useI18n';
import { useKopa } from '../../state/useKopa';
import type { Campaign } from '../../domain/types';

const MAX_KM = 120;

export function NearbyList({ campaign }: { campaign: Campaign }) {
  const { lang, t } = useI18n();
  const { campaigns } = useKopa();

  const neighbours = nearest(
    campaigns,
    { lat: campaign.lat, lng: campaign.lng },
    { excludeId: campaign.id, limit: 3, maxKm: MAX_KM },
  );

  if (neighbours.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {t(
          'detail.noNearby',
          'Nothing else is running within 120 km right now — this campaign is the only one in its area.',
        )}
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {neighbours.map((neighbour) => (
        <li key={neighbour.id} className="flex flex-col gap-1">
          <CampaignCard campaign={neighbour} compact />
          <p className="px-1 text-xs text-slate-500">
            {formatNumber(Math.round(neighbour.distanceKm), lang)} km{' '}
            {t('detail.away', 'away')}
          </p>
        </li>
      ))}
    </ul>
  );
}
