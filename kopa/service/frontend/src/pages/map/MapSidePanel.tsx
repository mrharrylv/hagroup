import { Link } from 'react-router-dom';
import { CampaignCard } from '../../components/CampaignCard';
import { CategoryIcon } from '../../components/CategoryIcon';
import { NextTierHint, TierLadder } from '../../components/TierLadder';
import { cityById } from '../../data/cities';
import { formatNumber } from '../../domain/dates';
import { isJoinable, statusOf, totalsFor } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign } from '../../domain/types';

export type NearbyCampaign = Campaign & { readonly distanceKm: number };

/**
 * The panel a clicked pin opens: a desktop rail on the right, a bottom sheet
 * on a phone. It carries enough to decide without leaving the map, and a
 * prominent link into the full campaign page for everything else.
 */
export function MapSidePanel({
  campaign,
  nearby,
  onClose,
  onJoin,
  onSelect,
}: {
  campaign: Campaign;
  nearby: readonly NearbyCampaign[];
  onClose: () => void;
  onJoin: () => void;
  onSelect: (campaign: Campaign) => void;
}) {
  const { lang, t, loc } = useI18n();
  const totals = totalsFor(campaign, campaign.participants);
  const status = statusOf(campaign, totals);
  const joinable = isJoinable(status);
  const city = cityById(campaign.cityId);
  const organiser = campaign.organizer.org ?? campaign.organizer.name;

  return (
    <aside
      aria-label={loc(campaign.title)}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-[800] max-h-[60vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-xl lg:inset-x-auto lg:top-28 lg:right-3 lg:bottom-3 lg:max-h-none lg:w-[380px] lg:rounded-2xl"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur">
        <h2 className="truncate text-sm font-semibold text-slate-900">
          {t('map.selected', 'Selected group buy')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('cta.close', 'Close')}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ✕
        </button>
      </header>

      <div className="space-y-4 px-4 py-4">
        <CampaignCard campaign={campaign} compact />

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{t('campaign.organiser', 'Organiser')}</dt>
            <dd className="truncate font-medium text-slate-800">{organiser}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{t('campaign.catchment', 'Catchment')}</dt>
            <dd className="font-medium text-slate-800">
              {campaign.radiusKm} km · {city?.name ?? campaign.cityId}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t('campaign.priceLadder', 'Price ladder')}
          </h3>
          <TierLadder campaign={campaign} totals={totals} compact />
          <NextTierHint campaign={campaign} totals={totals} className="mt-2" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onJoin}
            disabled={!joinable}
            className="bg-brand-600 hover:bg-brand-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {joinable ? t('cta.joinGroupBuy', 'Join group buy') : t('status.closed', 'Closed')}
          </button>
          <Link
            to={`/campaigns/${campaign.slug}`}
            className="border-brand-600 text-brand-700 hover:bg-brand-50 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold"
          >
            {t('cta.viewDetails', 'Open full campaign')} →
          </Link>
        </div>

        <div>
          <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t('map.nearby', 'Nearby')}
          </h3>
          {nearby.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t('map.noNearby', 'Nothing else close by yet.')}
            </p>
          ) : (
            <ul className="space-y-1">
              {nearby.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="hover:border-brand-300 flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-left hover:bg-slate-50"
                  >
                    <CategoryIcon category={item.category} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {loc(item.title)}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {cityById(item.cityId)?.name ?? item.cityId}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-500 tabular-nums">
                      {formatNumber(Math.round(item.distanceKm), lang)} km
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
