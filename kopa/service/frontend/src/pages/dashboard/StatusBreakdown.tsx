import { statusBadge } from '../../components/badges';
import { Badge } from '../../components/ui/Badge';
import type { CampaignStatus } from '../../domain/types';
import { useI18n } from '../../i18n/useI18n';
import { percent, share, type StatusRow } from './metrics';

/** Bar fills for the stacked status strip — same hues as the status badges. */
const STATUS_BAR: Record<CampaignStatus, string> = {
  new: 'bg-indigo-500',
  open: 'bg-slate-400',
  'almost-full': 'bg-amber-500',
  'closing-soon': 'bg-rose-500',
  funded: 'bg-emerald-600',
  closed: 'bg-slate-300',
};

/** How many campaigns sit in each status, as a stacked bar and a legend. */
export function StatusBreakdown({ rows, total }: { rows: readonly StatusRow[]; total: number }) {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="dash-status"
      className="mt-6 rounded-xl border border-slate-200 bg-white p-4"
    >
      <h2 id="dash-status" className="text-sm font-semibold text-slate-900">
        {t('dash.status', 'Status breakdown')}
      </h2>

      {total === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          {t('dash.statusEmpty', 'No campaigns to break down yet.')}
        </p>
      ) : (
        <>
          <div
            className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
            aria-hidden="true"
          >
            {rows
              .filter((row) => row.count > 0)
              .map((row) => (
                <div
                  key={row.status}
                  className={STATUS_BAR[row.status]}
                  style={{ width: `${share(row.count, total) * 100}%` }}
                  title={`${t(statusBadge(row.status).key, statusBadge(row.status).label)}: ${row.count}`}
                />
              ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {rows.map((row) => {
              const spec = statusBadge(row.status);
              return (
                <li key={row.status} className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${STATUS_BAR[row.status]}`}
                    aria-hidden="true"
                  />
                  <Badge tone={spec.tone}>{t(spec.key, spec.label)}</Badge>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {row.count}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {percent(row.count, total)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
