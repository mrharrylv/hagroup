import { formatMoney } from '../../domain/dates';
import { pricingSnapshot } from '../../domain/pricing';
import type { CampaignTotals } from '../../domain/status';
import { useI18n } from '../../i18n/useI18n';
import type { Campaign } from '../../domain/types';
import { unitShort } from './labels';

export function SupplierPanel({
  campaign,
  totals,
}: {
  campaign: Campaign;
  totals: CampaignTotals;
}) {
  const { lang, t, loc } = useI18n();
  const perUnit = unitShort(campaign, lang);

  if (campaign.supplierBids.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700">
          {t('detail.noBidsTitle', 'No supplier has bid yet.')}
        </p>
        <p className="mt-1 text-slate-500">
          {t(
            'detail.noBidsBody',
            'Suppliers are invited once the demand in one place is worth a delivery run. Every commitment brings this campaign closer to that point.',
          )}
        </p>
      </div>
    );
  }

  const best = pricingSnapshot(campaign, totals).current.pricePerUnit;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {/* Index keys: nothing stops one supplier bidding twice at the same
          price, and the list is never reordered or filtered. */}
      {campaign.supplierBids.map((bid, index) => (
        <li key={index} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{bid.supplier}</p>
            <p className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">
              {formatMoney(bid.pricePerUnit, lang)}
              <span className="text-xs font-normal text-slate-500"> / {perUnit}</span>
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {t('detail.leadTime', 'Delivery in')} {bid.leadTimeDays}{' '}
            {t('campaign.days', 'days')}
            {bid.pricePerUnit <= best && (
              <span className="ml-1.5 font-medium text-emerald-700">
                · {t('detail.beatsCurrent', 'at or below the current price')}
              </span>
            )}
          </p>
          <p className="mt-2 text-sm text-slate-600">{loc(bid.note)}</p>
        </li>
      ))}
    </ul>
  );
}
