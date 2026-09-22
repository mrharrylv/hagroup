import { Stat } from '../../components/ui/Stat';
import { formatMoney, formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { toPercent, type DashboardSummary } from './metrics';

/** The six headline tiles at the top of the console. */
export function KpiRow({ summary }: { summary: DashboardSummary }) {
  const { lang, t } = useI18n();

  const kpis = [
    {
      key: 'campaigns',
      icon: '📋',
      label: t('dash.kpi.campaigns', 'Campaigns'),
      value: formatNumber(summary.campaignCount, lang),
      hint: t('dash.kpi.campaignsHint', 'seeded + created here'),
    },
    {
      key: 'open',
      icon: '🟢',
      label: t('dash.kpi.open', 'Open now'),
      value: formatNumber(summary.openCount, lang),
      hint: t('dash.kpi.openHint', 'still accepting joins'),
    },
    {
      key: 'buyers',
      icon: '👥',
      label: t('dash.kpi.buyers', 'Buyers'),
      value: formatNumber(summary.totalBuyers, lang),
      hint: t('dash.kpi.buyersHint', 'commitments across all campaigns'),
    },
    {
      key: 'value',
      icon: '💶',
      label: t('dash.kpi.value', 'Committed value'),
      value: <Amount text={formatMoney(summary.totalValue, lang)} />,
      hint: t('dash.kpi.valueHint', 'at the tier prices unlocked so far'),
    },
    {
      key: 'saving',
      icon: '📉',
      label: t('dash.kpi.saving', 'Savings unlocked'),
      value: <Amount text={formatMoney(summary.totalSaving, lang)} />,
      hint: t('dash.kpi.savingHint', 'versus buying alone at retail'),
    },
    {
      key: 'progress',
      icon: '📊',
      label: t('dash.kpi.progress', 'Avg. progress'),
      value: `${formatNumber(toPercent(summary.averageProgress), lang)}%`,
      hint: t('dash.kpi.progressHint', 'mean of each campaign goal'),
    },
  ];

  return (
    <section aria-labelledby="dash-kpi" className="mb-8">
      <h2 id="dash-kpi" className="sr-only">
        {t('dash.kpi', 'Key numbers')}
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          // min-w-0 stops a long money value from widening its grid track at 375px.
          <div key={kpi.key} className="min-w-0">
            <Stat icon={kpi.icon} label={kpi.label} value={kpi.value} hint={kpi.hint} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Clips a long money value rather than letting it stretch its KPI tile. */
function Amount({ text }: { text: string }) {
  return (
    <span className="block truncate tabular-nums" title={text}>
      {text}
    </span>
  );
}
