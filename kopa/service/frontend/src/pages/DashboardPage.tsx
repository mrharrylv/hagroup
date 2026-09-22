import { useMemo } from 'react';
import { formatNumber } from '../domain/dates';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import { BreakdownTable } from './dashboard/BreakdownTable';
import { ClosingSoon } from './dashboard/ClosingSoon';
import { KpiRow } from './dashboard/KpiRow';
import { StatusBreakdown } from './dashboard/StatusBreakdown';
import { YourActivity } from './dashboard/YourActivity';
import {
  categoryRollup,
  closingSoon,
  factsForAll,
  regionRollup,
  statusRollup,
  summarise,
} from './dashboard/metrics';

/**
 * The internal demo console. It owns no numbers of its own: everything is
 * derived in `dashboard/metrics.ts` from the campaign list in the store, and
 * every section below is a presentation of one of those derivations.
 */
export default function DashboardPage() {
  const { campaigns } = useKopa();
  const { lang, t, loc } = useI18n();

  const facts = useMemo(() => factsForAll(campaigns), [campaigns]);
  const skipped = campaigns.length - facts.length;

  const summary = useMemo(() => summarise(facts), [facts]);
  const regionRows = useMemo(() => regionRollup(facts, loc), [facts, loc]);
  const categoryRows = useMemo(() => categoryRollup(facts, loc), [facts, loc]);
  const statusRows = useMemo(() => statusRollup(facts), [facts]);
  const closingRows = useMemo(() => closingSoon(facts), [facts]);

  const groupNote = t(
    'dash.groupNote',
    'Volume is listed per unit — litres, tonnes, m³ and pallets are never added together. Average saving is an unweighted mean across campaigns, so a small campaign counts as much as a large one.',
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
          {t('dash.eyebrow', 'Internal demo console')}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {t('dash.title', 'Marketplace dashboard')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t(
            'dash.subtitle',
            'Every number below is derived from the demo campaigns in this browser. Nothing here is real trading data.',
          )}
        </p>
        {skipped > 0 && (
          <p className="mt-2 text-xs text-amber-800">
            {formatNumber(skipped, lang)}{' '}
            {t(
              'dash.skipped',
              'stored campaigns have no price tiers and are left out of these numbers.',
            )}
          </p>
        )}
      </header>

      <KpiRow summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable
          id="dash-region"
          title={t('dash.byRegion', 'By region')}
          note={groupNote}
          firstHeader={t('dash.region', 'Region')}
          rows={regionRows}
          totalBuyers={summary.totalBuyers}
        />
        <BreakdownTable
          id="dash-category"
          title={t('dash.byCategory', 'By category')}
          note={groupNote}
          firstHeader={t('dash.category', 'Category')}
          rows={categoryRows}
          totalBuyers={summary.totalBuyers}
        />
      </div>

      <StatusBreakdown rows={statusRows} total={summary.campaignCount} />
      <ClosingSoon rows={closingRows} />
      <YourActivity facts={facts} />
    </div>
  );
}
