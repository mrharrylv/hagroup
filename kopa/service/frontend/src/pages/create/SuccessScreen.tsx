import { Link } from 'react-router-dom';
import { CampaignCard } from '../../components/CampaignCard';
import { cityById } from '../../data/cities';
import { useI18n } from '../../i18n/useI18n';
import { GHOST_BUTTON, PRIMARY_BUTTON } from './styles';
import type { Campaign } from '../../domain/types';

/** Replaces the form once `createCampaign` has accepted the draft. */
export function SuccessScreen({
  campaign,
  onCreateAnother,
}: {
  campaign: Campaign;
  onCreateAnother: () => void;
}) {
  const { t, loc } = useI18n();
  const city = cityById(campaign.cityId);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
        <p className="text-2xl" aria-hidden="true">
          ✅
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-emerald-900">
          {t('create.done.title', 'Your group buy is live')}
        </h1>
        <p className="mt-1 text-sm text-emerald-800">
          {t(
            'create.done.body',
            'It is on the map and in the listings straight away. Share the link and watch the price drop as buyers commit.',
          )}{' '}
          <span className="font-medium">
            {loc(campaign.title)} · {city?.name ?? campaign.cityId} · {campaign.radiusKm} km
          </span>
        </p>
      </div>

      <h2 className="mt-8 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {t('create.done.asBuyersSeeIt', 'As buyers see it')}
      </h2>
      <div className="mt-2">
        <CampaignCard campaign={campaign} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link className={PRIMARY_BUTTON} to={`/campaigns/${campaign.slug}`}>
          {t('create.done.view', 'View your campaign')}
        </Link>
        <Link className={GHOST_BUTTON} to={`/map?c=${campaign.slug}`}>
          {t('create.done.onMap', 'See it on the map')} 🗺️
        </Link>
        <button type="button" className={GHOST_BUTTON} onClick={onCreateAnother}>
          {t('create.done.another', 'Create another')}
        </button>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        {t(
          'create.done.demoNote',
          'Demo build. The campaign is stored in this browser only, and the contact details you entered were never sent anywhere.',
        )}
      </p>
    </div>
  );
}
