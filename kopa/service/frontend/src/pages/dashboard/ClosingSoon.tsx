import { NextTierHint } from '../../components/TierLadder';
import { progressTone } from '../../components/badges';
import { Progress } from '../../components/ui/Progress';
import { cityById } from '../../data/cities';
import { formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { toPercent, type Facts } from './metrics';
import { CampaignLink, Empty } from './parts';

/** Campaigns running out of time this week while still short of their goal. */
export function ClosingSoon({ rows }: { rows: readonly Facts[] }) {
  const { lang, t, loc } = useI18n();

  return (
    <section
      aria-labelledby="dash-closing"
      className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
        <h2 id="dash-closing" className="text-sm font-semibold text-slate-900">
          {t('dash.closing', 'Closing soon, goal not reached')}
        </h2>
        <span className="text-xs text-slate-500">{t('dash.closingHint', 'ends within 7 days')}</span>
      </div>

      {rows.length === 0 ? (
        <Empty>{t('dash.closingEmpty', 'Nothing is closing short of its goal this week.')}</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  {t('dash.campaign', 'Campaign')}
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  {t('dash.city', 'City')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.daysLeft', 'Days left')}
                </th>
                <th scope="col" className="w-44 px-4 py-2 font-medium">
                  {t('dash.progress', 'Progress')}
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  {t('dash.needed', 'Needed for next tier')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.campaign.id} className="border-t border-slate-100 align-middle">
                  <td className="px-4 py-2">
                    <CampaignLink campaign={f.campaign} />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                    {cityById(f.campaign.cityId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-rose-700 tabular-nums">
                    {formatNumber(f.campaign.endsInDays, lang)}
                  </td>
                  <td className="w-44 px-4 py-2">
                    <Progress
                      value={f.progress}
                      tone={progressTone(f.totals, f.status)}
                      label={`${loc(f.campaign.title)} — ${t('dash.progress', 'Progress')}`}
                    />
                    <span className="mt-1 block text-xs text-slate-500 tabular-nums">
                      {toPercent(f.progress)}%
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <NextTierHint campaign={f.campaign} totals={f.totals} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
