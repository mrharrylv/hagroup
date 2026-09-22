import { unitById } from '../../data/taxonomy';
import { formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { percent, share, type GroupRow, type UnitTotal } from './metrics';
import { Empty } from './parts';

/**
 * One rollup table, used for both the region and the category breakdown —
 * they are the same five columns over a differently keyed grouping.
 */
export function BreakdownTable({
  id,
  title,
  note,
  firstHeader,
  rows,
  totalBuyers,
}: {
  id: string;
  title: string;
  note: string;
  firstHeader: string;
  rows: readonly GroupRow[];
  totalBuyers: number;
}) {
  const { lang, t } = useI18n();

  return (
    <section
      aria-labelledby={id}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="px-4 py-3">
        <h2 id={id} className="text-sm font-semibold text-slate-900">
          {title}
        </h2>
        <p className="text-xs text-slate-500">{note}</p>
      </div>

      {rows.length === 0 ? (
        <Empty>{t('dash.groupEmpty', 'No campaigns to aggregate yet.')}</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  {firstHeader}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.colCampaigns', 'Camp.')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.colBuyers', 'Buyers')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.colUnits', 'Units')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  {t('dash.colSaving', 'Avg. save')}
                </th>
                <th scope="col" className="w-40 px-4 py-2 font-medium">
                  {t('dash.colShare', 'Buyer share')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {row.icon !== undefined && (
                      <span aria-hidden="true" className="mr-1.5">
                        {row.icon}
                      </span>
                    )}
                    {row.label}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600 tabular-nums">
                    {formatNumber(row.campaigns, lang)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900 tabular-nums">
                    {formatNumber(row.buyers, lang)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600 tabular-nums">
                    <UnitTotals totals={row.unitTotals} />
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-emerald-700 tabular-nums">
                    {row.savingPercent > 0 ? `${formatNumber(row.savingPercent, lang)}%` : '—'}
                  </td>
                  <td className="w-40 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
                        aria-hidden="true"
                      >
                        <div
                          className="bg-brand-500 h-full rounded-full"
                          style={{ width: `${share(row.buyers, totalBuyers) * 100}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-xs text-slate-500 tabular-nums">
                        {percent(row.buyers, totalBuyers)}%
                      </span>
                    </div>
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

/**
 * Committed volume, one figure per unit of measure. Litres, tonnes, m³ and
 * pallets are deliberately kept apart: their sum is a number with no dimension,
 * and it used to be printed here as if it were a quantity.
 */
function UnitTotals({ totals }: { totals: readonly UnitTotal[] }) {
  const { lang } = useI18n();

  if (totals.length === 0) return <>—</>;

  return (
    <span className="flex flex-wrap justify-end gap-x-2 gap-y-0.5">
      {totals.map((total) => (
        <span key={total.unitId} className="whitespace-nowrap">
          {formatNumber(total.units, lang)} {unitById(total.unitId)?.short[lang] ?? total.unitId}
        </span>
      ))}
    </span>
  );
}
