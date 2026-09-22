import { plural } from '../../i18n/plural';
import { progressTone } from '../../components/badges';
import { Progress } from '../../components/ui/Progress';
import { formatDate, formatNumber } from '../../domain/dates';
import { pricingSnapshot } from '../../domain/pricing';
import type { CampaignTotals } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign, CampaignStatus } from '../../domain/types';
import { metricNoun, unitLong } from './labels';
import { useCountdown } from './useCountdown';

export function ProgressBlock({
  campaign,
  totals,
  status,
  endsAt,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
  status: CampaignStatus;
  endsAt: Date;
}) {
  const { lang, t } = useI18n();
  const snapshot = pricingSnapshot(campaign, totals);
  const tone = progressTone(totals, status);

  const buyersNeeded = Math.max(0, campaign.targetBuyers - totals.buyerCount);
  const unitsNeeded = Math.max(0, campaign.targetUnits - totals.committedUnits);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-lg font-semibold text-slate-900">
        {snapshot.next === null || snapshot.toNext === null
          ? t('detail.bestUnlocked', 'The best price is already unlocked for everyone.')
          : `${formatNumber(snapshot.toNext, lang)} ${t('detail.moreNeededSuffix', 'more')} ${metricNoun(campaign, lang, t)} ${t('detail.needed', 'needed')}`}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">
        {snapshot.next === null
          ? t('detail.bestUnlockedHint', 'Every new commitment now just adds volume to the order.')
          : t('detail.nextDropHint', 'That is what it takes for the next price drop.')}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Bar
          label={t('campaign.buyers', 'buyers')}
          done={formatNumber(totals.buyerCount, lang)}
          goal={formatNumber(campaign.targetBuyers, lang)}
          hint={
            buyersNeeded === 0
              ? t('detail.buyerGoalMet', 'Buyer goal reached')
              : `${formatNumber(buyersNeeded, lang)} ${t('detail.moreBuyersNeeded', 'more buyers needed')}`
          }
          value={totals.buyerProgress}
          tone={tone}
        />
        <Bar
          label={unitLong(campaign, lang)}
          done={formatNumber(totals.committedUnits, lang)}
          goal={formatNumber(campaign.targetUnits, lang)}
          hint={
            unitsNeeded === 0
              ? t('detail.volumeGoalMet', 'Volume goal reached')
              : `${formatNumber(unitsNeeded, lang)} ${t('detail.more', 'more')} ${unitLong(campaign, lang)} ${t('detail.needed', 'needed')}`
          }
          value={totals.unitProgress}
          tone={tone}
        />
      </div>

      <CountdownRow campaign={campaign} endsAt={endsAt} />
    </div>
  );
}

function Bar({
  label,
  done,
  goal,
  hint,
  value,
  tone,
}: {
  label: string;
  done: string;
  goal: string;
  hint: string;
  value: number;
  tone: 'brand' | 'amber' | 'emerald' | 'slate';
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">
          <span className="text-base font-semibold text-slate-900 tabular-nums">{done}</span>
          <span className="text-slate-400"> / {goal}</span> {label}
        </span>
        <span className="text-xs text-slate-500 tabular-nums">
          {Math.round(value * 100)}%
        </span>
      </div>
      <Progress value={value} tone={tone} label={`${done} / ${goal} ${label}`} />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function CountdownRow({ campaign, endsAt }: { campaign: Campaign; endsAt: Date }) {
  const { lang, t } = useI18n();
  const live = campaign.endsInDays >= 0;
  const countdown = useCountdown(endsAt, live);

  if (!live || countdown.expired) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-sm">
        <span className="font-medium text-slate-600">{t('time.ended', 'Ended')}</span>
        <span className="text-slate-400">{formatDate(endsAt, lang)}</span>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          {t('campaign.endsIn', 'Closes in')}
        </p>
        <p className="text-xs text-slate-400">{formatDate(endsAt, lang)}</p>
      </div>
      <div
        role="timer"
        aria-label={t('a11y.countdown', 'Time left to join')}
        className="flex gap-2"
      >
        <TimeBox
          value={countdown.days}
          label={plural(countdown.days, lang, {
            one: t('time.unit.day', 'day'),
            many: t('time.unit.days', 'days'),
          })}
        />
        <TimeBox value={countdown.hours} label={t('time.unit.hours', 'hrs')} />
        <TimeBox value={countdown.minutes} label={t('time.unit.minutes', 'min')} />
        <TimeBox value={countdown.seconds} label={t('time.unit.seconds', 'sec')} />
      </div>
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[3.25rem] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center">
      <div className="text-lg leading-tight font-semibold text-slate-900 tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] tracking-wide text-slate-500 uppercase">{label}</div>
    </div>
  );
}
