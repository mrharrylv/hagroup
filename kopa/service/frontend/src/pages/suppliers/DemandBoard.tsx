import { formatMoney, formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { CategoryIcon } from '../../components/CategoryIcon';
import { Badge } from '../../components/ui/Badge';
import type { DemandRow } from './demand';
import { categoryLabel, regionLabel, unitLong, unitShort } from './labels';
import {
  EMPTY_CLASS,
  HEADING_CLASS,
  PANEL_CLASS,
  SECTION_CLASS,
  SECTION_HEAD_CLASS,
  SECTION_NOTE_CLASS,
} from './styles';

const BOARD_COLUMNS = [
  ['suppliers.board.category', 'Category'],
  ['suppliers.board.open', 'Open'],
  ['suppliers.board.demand', 'Demand'],
  ['suppliers.board.buyers', 'Buyers'],
  ['suppliers.board.best', 'Best tier now'],
  ['suppliers.board.regions', 'Regions'],
] as const;

const CELL = 'px-4 py-3';
const CELL_MUTED = `${CELL} text-slate-700`;

/** Stands in for a number that does not exist, rather than printing a zero. */
const NO_VALUE = '—';

/**
 * Demand per unit type, one line each.
 *
 * The lines are never added together: litres, tonnes and pallets are not the
 * same quantity, so a single total would be physically meaningless. The money
 * figure underneath is the cross-unit comparable, and it says "approx."
 * because it prices today's tier rather than the tier the campaign will close
 * at — see `unitTotals` and `committedValueOf` in demand.ts.
 */
function DemandCell({ row }: { row: DemandRow }) {
  const { t, lang } = useI18n();

  return (
    <td className={CELL}>
      {row.byUnit.length === 0 ? (
        <span className="text-slate-400">{NO_VALUE}</span>
      ) : (
        row.byUnit.map((entry) => (
          <span key={entry.unitId} className="block font-semibold text-slate-900">
            {formatNumber(entry.units, lang)} {unitLong(entry.unitId, lang)}
          </span>
        ))
      )}
      {row.committedValue > 0 && (
        <span className="mt-0.5 block text-xs text-slate-500">
          {t('suppliers.board.valueAt', 'approx.')} {formatMoney(row.committedValue, lang)}
        </span>
      )}
    </td>
  );
}

/** The deepest discount unlocked anywhere in the category right now. */
function BestPriceCell({ row }: { row: DemandRow }) {
  const { lang } = useI18n();

  if (row.best === null) {
    return (
      <td className={CELL}>
        <span className="text-slate-400">{NO_VALUE}</span>
      </td>
    );
  }

  return (
    <td className={CELL}>
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-900">
          {formatMoney(row.best.pricePerUnit, lang)} / {unitShort(row.best.unitId, lang)}
        </span>
        {row.best.savingPercent > 0 && (
          <Badge tone="emerald">−{formatNumber(row.best.savingPercent, lang)}%</Badge>
        )}
      </span>
    </td>
  );
}

function BoardRow({ row }: { row: DemandRow }) {
  const { lang, loc } = useI18n();

  return (
    <tr className="align-top">
      <th scope="row" className={`${CELL} font-medium text-slate-900`}>
        <span className="flex items-center gap-2">
          <CategoryIcon category={row.categoryId} size="sm" />
          {categoryLabel(row.categoryId, loc)}
        </span>
      </th>
      <td className={CELL_MUTED}>{formatNumber(row.openCampaigns, lang)}</td>
      <DemandCell row={row} />
      {/* Commitments, not distinct people: see `buyersIn` in demand.ts. */}
      <td className={CELL_MUTED}>{formatNumber(row.buyers, lang)}</td>
      <BestPriceCell row={row} />
      <td className={CELL}>
        <span className="flex flex-wrap gap-1">
          {row.regions.map((regionId) => (
            <Badge key={regionId} tone="slate">
              {regionLabel(regionId, loc)}
            </Badge>
          ))}
        </span>
      </td>
    </tr>
  );
}

function BoardTable({ rows }: { rows: readonly DemandRow[] }) {
  const { t } = useI18n();

  return (
    <div className={`mt-4 overflow-x-auto ${PANEL_CLASS}`}>
      <table className="w-full min-w-[46rem] text-left text-sm">
        <caption className="sr-only">
          {t('suppliers.board.caption', 'Open demand grouped by product category.')}
        </caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            {BOARD_COLUMNS.map(([key, english]) => (
              <th key={key} scope="col" className={`${CELL} font-medium`}>
                {t(key, english)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <BoardRow key={row.categoryId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Open demand per category, richest first — categories with nothing running are absent. */
export function DemandBoard({ rows }: { rows: readonly DemandRow[] }) {
  const { t } = useI18n();

  return (
    <section className={SECTION_CLASS} aria-labelledby="demand-board">
      <div className={SECTION_HEAD_CLASS}>
        <h2 id="demand-board" className={HEADING_CLASS}>
          {t('suppliers.board.title', 'Demand board')}
        </h2>
        <p className={SECTION_NOTE_CLASS}>
          {t('suppliers.board.note', 'Open campaigns only, largest demand first.')}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className={EMPTY_CLASS}>
          {t('suppliers.board.empty', 'No open campaigns right now. Check the map again shortly.')}
        </p>
      ) : (
        <BoardTable rows={rows} />
      )}
    </section>
  );
}
