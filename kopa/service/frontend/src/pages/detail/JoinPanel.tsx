import type { ReactNode } from 'react';
import { NextTierHint } from '../../components/TierLadder';
import { formatDate, formatMoney, formatNumber } from '../../domain/dates';
import { pricingSnapshot } from '../../domain/pricing';
import { isJoinable, type CampaignTotals } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import { useKopa } from '../../state/useKopa';
import type { Campaign, CampaignStatus } from '../../domain/types';
import { unitLong, unitShort } from './labels';

/** The sticky buy-box on large screens. */
export function JoinPanel({
  campaign,
  totals,
  status,
  endsAt,
  onJoinClick,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
  status: CampaignStatus;
  endsAt: Date;
  onJoinClick: () => void;
}) {
  const { lang, t } = useI18n();
  const { hasJoined, myUnits } = useKopa();

  const snapshot = pricingSnapshot(campaign, totals);
  const joined = hasJoined(campaign.id);
  const mine = myUnits(campaign.id);
  const open = isJoinable(status);
  const perUnit = unitShort(campaign, lang);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {t('campaign.currentPrice', 'Price now')}
      </p>
      <p className="mt-1 text-3xl font-semibold text-slate-900 tabular-nums">
        {formatMoney(snapshot.current.pricePerUnit, lang)}
        <span className="text-base font-normal text-slate-500"> / {perUnit}</span>
      </p>
      {snapshot.savingPerUnit > 0 && (
        <p className="mt-1 text-sm text-slate-500">
          <s>{formatMoney(campaign.retailPricePerUnit, lang)}</s>{' '}
          <span className="font-medium text-emerald-700">
            −{snapshot.savingPercent}% {t('campaign.vsRetail', 'vs retail')}
          </span>
        </p>
      )}

      <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <Line label={t('campaign.joined', 'Buyers joined')}>
          {formatNumber(totals.buyerCount, lang)} / {formatNumber(campaign.targetBuyers, lang)}
        </Line>
        <Line label={t('campaign.committed', 'Committed')}>
          {formatNumber(totals.committedUnits, lang)} {unitLong(campaign, lang)}
        </Line>
        <Line label={t('detail.closesLabel', 'Closes')}>
          {campaign.endsInDays < 0
            ? t('time.ended', 'Ended')
            : campaign.endsInDays === 0
              ? t('detail.closesToday', 'Today')
              : `${campaign.endsInDays} ${t('campaign.days', 'days')}`}
          <span className="ml-1 text-slate-400">({formatDate(endsAt, lang)})</span>
        </Line>
      </dl>

      <NextTierHint campaign={campaign} totals={totals} className="mt-3" />

      {joined ? (
        <div className="border-brand-200 bg-brand-50 mt-4 rounded-lg border p-3">
          <p className="text-brand-900 text-sm font-semibold">
            ✓ {t('detail.joinedTitle', 'You are in this group buy')}
          </p>
          <p className="text-brand-800 mt-1 text-sm">
            {t('detail.joinedUnits', 'Your commitment:')}{' '}
            <span className="font-semibold tabular-nums">
              {formatNumber(mine, lang)} {unitLong(campaign, lang)}
            </span>
          </p>
          <p className="text-brand-700 mt-1 text-xs">
            {t('detail.joinedCost', 'At the current tier that is')}{' '}
            {formatMoney(snapshot.current.pricePerUnit * mine, lang)}.
          </p>
          <button
            type="button"
            onClick={onJoinClick}
            disabled={!open}
            className="border-brand-300 text-brand-800 hover:bg-brand-100 focus-visible:outline-brand-700 mt-3 w-full rounded-lg border bg-white px-4 py-2 text-sm font-medium focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('detail.addMore', 'Commit more units')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onJoinClick}
          disabled={!open}
          className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-700 mt-4 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {open
            ? t('cta.joinGroupBuy', 'Join this group buy')
            : t('detail.closedCta', 'This campaign has closed')}
        </button>
      )}

      <p className="mt-2 text-center text-xs text-slate-400">
        {t('detail.noCommitment', 'Demo only — nothing is ordered or charged.')}
      </p>
    </div>
  );
}

/** The same decision, pinned to the bottom of the screen on small viewports. */
export function MobileJoinBar({
  campaign,
  totals,
  status,
  onJoinClick,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
  status: CampaignStatus;
  onJoinClick: () => void;
}) {
  const { lang, t } = useI18n();
  const { hasJoined, myUnits } = useKopa();

  const snapshot = pricingSnapshot(campaign, totals);
  const joined = hasJoined(campaign.id);
  const open = isJoinable(status);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[900] border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-slate-900 tabular-nums">
            {formatMoney(snapshot.current.pricePerUnit, lang)}
            <span className="text-xs font-normal text-slate-500">
              {' '}
              / {unitShort(campaign, lang)}
            </span>
          </p>
          <p className="truncate text-xs text-slate-500">
            {joined
              ? `${t('detail.yourCommitment', 'You committed')} ${formatNumber(myUnits(campaign.id), lang)} ${unitLong(campaign, lang)}`
              : `${formatNumber(totals.buyerCount, lang)} / ${formatNumber(campaign.targetBuyers, lang)} ${t('campaign.buyers', 'buyers')}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onJoinClick}
          disabled={!open}
          className="bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-700 shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 disabled:bg-slate-300"
        >
          {!open
            ? t('status.closed', 'Closed')
            : joined
              ? t('detail.addMoreShort', 'Add more')
              : t('cta.join', 'Join')}
        </button>
      </div>
    </div>
  );
}

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800 tabular-nums">{children}</dd>
    </div>
  );
}
