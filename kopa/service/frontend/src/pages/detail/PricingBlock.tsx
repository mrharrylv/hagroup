import { TierLadder } from '../../components/TierLadder';
import { Stat } from '../../components/ui/Stat';
import { formatMoney, formatNumber } from '../../domain/dates';
import { bestPossiblePrice, bestPossibleSavingPercent, pricingSnapshot } from '../../domain/pricing';
import type { CampaignTotals } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign } from '../../domain/types';
import { unitLong, unitShort } from './labels';

export function PricingBlock({
  campaign,
  totals,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
}) {
  const { lang, t } = useI18n();
  const snapshot = pricingSnapshot(campaign, totals);
  const perUnit = unitShort(campaign, lang);
  const best = bestPossiblePrice(campaign.tiers);
  const bestPercent = Math.max(0, bestPossibleSavingPercent(campaign));
  const alreadyBest = best >= snapshot.current.pricePerUnit;

  // A tier priced above retail is nonsense data, not a negative saving.
  const savingPerUnit = Math.max(0, snapshot.savingPerUnit);
  const savingPercent = Math.max(0, snapshot.savingPercent);

  return (
    <div className="space-y-4">
      <TierLadder campaign={campaign} totals={totals} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t('campaign.retailPrice', 'Retail price')}
          value={<span className="tabular-nums">{formatMoney(campaign.retailPricePerUnit, lang)}</span>}
          hint={`${t('detail.per', 'per')} ${perUnit}`}
        />
        <Stat
          label={t('campaign.currentPrice', 'Price now')}
          value={
            <span className="text-brand-700 tabular-nums">
              {formatMoney(snapshot.current.pricePerUnit, lang)}
            </span>
          }
          hint={`${t('detail.per', 'per')} ${perUnit}`}
        />
        <Stat
          label={t('detail.savingPerUnit', 'You save per unit')}
          value={
            <span className="text-emerald-700 tabular-nums">
              −{formatMoney(savingPerUnit, lang)}
            </span>
          }
          hint={`−${savingPercent}% ${t('campaign.vsRetail', 'vs retail')}`}
        />
        <Stat
          label={t('detail.groupSaved', 'Saved by the group so far')}
          value={
            <span className="text-emerald-700 tabular-nums">
              {formatMoney(Math.max(0, snapshot.totalSaving), lang)}
            </span>
          }
          hint={`${formatNumber(totals.committedUnits, lang)} ${unitLong(campaign, lang)} ${t('detail.committedSuffix', 'committed')}`}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">
          {alreadyBest
            ? t('detail.bestTierReached', 'This campaign has already reached its best tier.')
            : `${t('detail.bestTierIf', 'If this campaign reaches its best tier you pay')} ${formatMoney(best, lang)} ${t('detail.insteadOf', 'instead of')} ${formatMoney(snapshot.current.pricePerUnit, lang)} ${t('detail.per', 'per')} ${perUnit}.`}
        </p>

        {/* Three money columns do not fit 375px minus four levels of padding;
            scroll the table rather than crush the numbers. */}
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[21rem] border-collapse text-sm">
            <thead className="bg-white text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  {t('detail.scenario', 'Scenario')}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {t('detail.perUnitCol', 'Per')} {perUnit}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {t('detail.fullTarget', 'Full target')} (
                  {formatNumber(campaign.targetUnits, lang)})
                </th>
              </tr>
            </thead>
            <tbody>
              <Row
                label={t('detail.retailRow', 'Buying alone (retail)')}
                price={campaign.retailPricePerUnit}
                units={campaign.targetUnits}
                lang={lang}
              />
              <Row
                label={t('detail.priceNowRow', "Today's group price")}
                price={snapshot.current.pricePerUnit}
                units={campaign.targetUnits}
                lang={lang}
                highlight
              />
              <Row
                label={`${t('detail.bestTierRow', 'Best tier')} (−${bestPercent}%)`}
                price={best}
                units={campaign.targetUnits}
                lang={lang}
                positive
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  price,
  units,
  lang,
  highlight = false,
  positive = false,
}: {
  label: string;
  price: number;
  units: number;
  lang: 'en' | 'lv';
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <tr
      className={
        highlight
          ? 'bg-brand-50/70 font-semibold text-brand-900'
          : positive
            ? 'text-emerald-800'
            : 'text-slate-600'
      }
    >
      <td className="border-t border-slate-100 px-3 py-2">{label}</td>
      <td className="border-t border-slate-100 px-3 py-2 text-right tabular-nums">
        {formatMoney(price, lang)}
      </td>
      <td className="border-t border-slate-100 px-3 py-2 text-right tabular-nums">
        {formatMoney(price * units, lang)}
      </td>
    </tr>
  );
}
