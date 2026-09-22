import { CampaignCard } from '../../components/CampaignCard';
import { TierLadder } from '../../components/TierLadder';
import { formatMoney } from '../../domain/dates';
import { bestPossiblePrice, bestPossibleSavingPercent } from '../../domain/pricing';
import { totalsFor } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign } from '../../domain/types';

/**
 * The sticky right-hand column: the exact `<CampaignCard>` buyers will see,
 * rebuilt from the draft on every keystroke. The card is a `<Link>` to a
 * campaign that does not exist yet, so the preview copy is `inert` — visible,
 * but not clickable and not in the tab order.
 */
export function LivePreview({ campaign }: { campaign: Campaign }) {
  const { lang, t } = useI18n();
  const totals = totalsFor(campaign, campaign.participants);
  const best = bestPossiblePrice(campaign.tiers);
  const bestPercent = bestPossibleSavingPercent(campaign);

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          {t('create.preview.title', 'Live preview')}
        </h2>
        <span className="text-xs text-slate-400">
          {t('create.preview.nothingSaved', 'Nothing saved yet')}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {t('create.preview.hint', 'This is the card buyers see. It updates as you type.')}
      </p>

      <div inert className="mt-3">
        <CampaignCard campaign={campaign} />
      </div>

      <h3 className="mt-6 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {t('create.preview.ladder', 'Your price ladder')}
      </h3>
      <div className="mt-2">
        <TierLadder campaign={campaign} totals={totals} compact />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <dt className="text-xs text-slate-500">
            {t('create.preview.bestPrice', 'Best price on offer')}
          </dt>
          <dd className="mt-0.5 text-lg font-semibold text-slate-900 tabular-nums">
            {Number.isFinite(best) ? formatMoney(best, lang) : '—'}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <dt className="text-xs text-slate-500">
            {t('create.preview.bestSaving', 'Headline saving')}
          </dt>
          <dd className="mt-0.5 text-lg font-semibold text-emerald-700 tabular-nums">
            {bestPercent > 0 ? `−${bestPercent}%` : '—'}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-slate-400">
        {t(
          'create.preview.demoNote',
          'Demo build — this campaign lives in your browser only and no message is sent to anyone.',
        )}
      </p>
    </aside>
  );
}
