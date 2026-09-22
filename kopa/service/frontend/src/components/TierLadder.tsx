import { formatMoney, formatNumber } from '../domain/dates';
import { pricingSnapshot, sortedTiers } from '../domain/pricing';
import type { CampaignTotals } from '../domain/status';
import { unitById } from '../data/taxonomy';
import { useI18n } from '../i18n/useI18n';
import type { Campaign, PriceTier } from '../domain/types';

/** Describes a tier's range in the campaign's own metric, e.g. "10–19 buyers". */
export function tierRangeLabel(campaign: Campaign, tier: PriceTier, lang: 'en' | 'lv'): string {
  const unit = unitById(campaign.unit);
  const noun =
    campaign.tierBasis === 'buyers'
      ? lang === 'lv'
        ? 'pircēji'
        : 'buyers'
      : (unit?.long[lang] ?? campaign.unit);

  const from = formatNumber(tier.min, lang);
  if (tier.max === null) return `${from}+ ${noun}`;
  if (tier.min === 0) return `< ${formatNumber(tier.max + 1, lang)} ${noun}`;
  return `${from}–${formatNumber(tier.max, lang)} ${noun}`;
}

export function TierLadder({
  campaign,
  totals,
  compact = false,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
  compact?: boolean;
}) {
  const { lang, t } = useI18n();
  const snapshot = pricingSnapshot(campaign, totals);
  const unit = unitById(campaign.unit);
  const perUnit = unit?.short[lang] ?? campaign.unit;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              {campaign.tierBasis === 'buyers'
                ? t('tier.buyers', 'Buyers')
                : t('tier.volume', 'Total volume')}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {t('tier.price', 'Price')} / {perUnit}
            </th>
            {!compact && (
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {t('tier.save', 'You save')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedTiers(campaign.tiers).map((tier) => {
            const isCurrent = tier === snapshot.current;
            const isNext = tier === snapshot.next;
            const saving = campaign.retailPricePerUnit - tier.pricePerUnit;

            return (
              <tr
                key={`${tier.min}-${tier.pricePerUnit}`}
                className={
                  isCurrent
                    ? 'bg-brand-50/70 font-semibold text-brand-900'
                    : isNext
                      ? 'bg-white text-slate-700'
                      : 'bg-white text-slate-500'
                }
              >
                <td className="border-t border-slate-100 px-3 py-2">
                  <span className="flex items-center gap-2">
                    {tierRangeLabel(campaign, tier, lang)}
                    {isCurrent && (
                      <span className="bg-brand-600 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                        {t('tier.current', 'Now')}
                      </span>
                    )}
                    {isNext && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 uppercase">
                        {t('tier.next', 'Next')}
                      </span>
                    )}
                  </span>
                </td>
                <td className="border-t border-slate-100 px-3 py-2 text-right tabular-nums">
                  {formatMoney(tier.pricePerUnit, lang)}
                </td>
                {!compact && (
                  <td className="border-t border-slate-100 px-3 py-2 text-right tabular-nums">
                    {saving > 0 ? (
                      <span className="text-emerald-700">−{formatMoney(saving, lang)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The single line that makes the mechanic obvious:
 * "Only 6 more buyers needed" / "1,200 L more for the next price drop".
 */
export function NextTierHint({
  campaign,
  totals,
  className = '',
}: {
  campaign: Campaign;
  totals: CampaignTotals;
  className?: string;
}) {
  const { lang, t } = useI18n();
  const snapshot = pricingSnapshot(campaign, totals);

  if (snapshot.next === null || snapshot.toNext === null) {
    return (
      <p className={`text-sm font-medium text-emerald-700 ${className}`}>
        {t('tier.bestReached', 'Best price already unlocked')}
      </p>
    );
  }

  const unit = unitById(campaign.unit);
  const noun =
    campaign.tierBasis === 'buyers'
      ? lang === 'lv'
        ? 'pircēji'
        : 'more buyers'
      : (unit?.long[lang] ?? campaign.unit);

  return (
    <p className={`text-sm font-medium text-amber-800 ${className}`}>
      {t('tier.only', 'Only')} {formatNumber(snapshot.toNext, lang)} {noun}{' '}
      {t('tier.toUnlock', 'to unlock')} {formatMoney(snapshot.next.pricePerUnit, lang)}
    </p>
  );
}
