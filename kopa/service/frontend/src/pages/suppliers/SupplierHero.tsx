import { Link } from 'react-router-dom';
import { formatMoney, formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { Badge } from '../../components/ui/Badge';
import { Stat } from '../../components/ui/Stat';
import { boardTotals, type DemandRow } from './demand';
import { BTN_PRIMARY, PANEL_CLASS, SECTION_NOTE_CLASS } from './styles';

/**
 * The page's opening claim and the three numbers behind it.
 *
 * The stats are added up from the board's own rows, so the headline and the
 * table below can never disagree. Both carry a caveat the hint text states out
 * loud: the money figure exists because mixed units cannot be summed, and the
 * buyer figure counts commitments rather than distinct people — see
 * `committedValueOf` and `buyersIn` in demand.ts.
 */
export function SupplierHero({ rows }: { rows: readonly DemandRow[] }) {
  const { t, lang } = useI18n();
  const totals = boardTotals(rows);

  return (
    <header className={`${PANEL_CLASS} p-6 sm:p-8`}>
      <Badge tone="brand">{t('suppliers.badge', 'For suppliers')}</Badge>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
        {t('suppliers.hero.title', 'Concentrated demand, one delivery, one invoice.')}
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        {t(
          'suppliers.hero.body',
          'Buyers across Latvia pool what they need before they ask for a price. You quote once, deliver once and invoice once — against volume that already exists.',
        )}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link to="/map" className={`inline-flex items-center gap-2 ${BTN_PRIMARY}`}>
          <span aria-hidden="true">🗺️</span>
          {t('suppliers.hero.cta', 'See live demand')}
        </Link>
        <span className={SECTION_NOTE_CLASS}>
          {t('suppliers.hero.demo', 'Demo data — nothing here is a real order.')}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label={t('suppliers.stat.campaigns', 'Open campaigns')}
          value={formatNumber(totals.openCampaigns, lang)}
          icon={<span aria-hidden="true">📋</span>}
        />
        <Stat
          label={t('suppliers.stat.value', 'Demand on the table')}
          value={formatMoney(totals.committedValue, lang)}
          hint={t('suppliers.stat.valueHint', 'Committed volume at today’s tier price.')}
          icon={<span aria-hidden="true">📦</span>}
        />
        <Stat
          label={t('suppliers.stat.buyers', 'Buyers waiting')}
          value={formatNumber(totals.buyers, lang)}
          hint={t('suppliers.stat.buyersHint', 'Commitments across all open campaigns.')}
          icon={<span aria-hidden="true">👥</span>}
        />
      </div>
    </header>
  );
}
