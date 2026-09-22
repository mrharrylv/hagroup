import { unitById } from '../../data/taxonomy';
import { useI18n } from '../../i18n/useI18n';
import { NumberField } from './fields';
import { toNumber } from './model';
import { ERROR, GHOST_BUTTON, INPUT } from './styles';
import type { PriceTier, TierBasis, UnitId } from '../../domain/types';

/**
 * The discount ladder editor. Rows are `{min, max, price}`; an empty "up to"
 * box means the tier is open-ended, which is what `PriceTier.max === null`
 * encodes. Every edit produces a new array — nothing is mutated in place.
 */
export function TierEditor({
  tiers,
  basis,
  unit,
  retail,
  error,
  onChange,
  onReseed,
}: {
  tiers: readonly PriceTier[];
  basis: TierBasis;
  unit: UnitId;
  retail: number;
  error?: string;
  onChange: (tiers: readonly PriceTier[]) => void;
  onReseed: () => void;
}) {
  const { lang, t } = useI18n();
  const metric =
    basis === 'buyers'
      ? t('create.tier.buyersNoun', 'buyers')
      : (unitById(unit)?.long[lang] ?? unit);

  function replaceAt(index: number, next: PriceTier) {
    onChange(tiers.map((tier, position) => (position === index ? next : tier)));
  }

  function removeAt(index: number) {
    onChange(tiers.filter((_, position) => position !== index));
  }

  function addTier() {
    const last = tiers[tiers.length - 1];
    const min = last === undefined ? 0 : Math.max(last.min + 1, (last.max ?? last.min) + 1);
    const cheapest = tiers.reduce(
      (lowest, tier) => Math.min(lowest, tier.pricePerUnit),
      retail > 0 ? retail : 1,
    );
    onChange([...tiers, { min, max: null, pricePerUnit: Math.round(cheapest * 95) / 100 }]);
  }

  return (
    <div>
      <div className="hidden gap-2 px-1 pb-1 text-xs font-medium tracking-wide text-slate-500 uppercase sm:grid sm:grid-cols-[1fr_1fr_1fr_5.5rem]">
        <span>{`${t('create.tier.from', 'From')} (${metric})`}</span>
        <span>{t('create.tier.upTo', 'Up to')}</span>
        <span>{t('create.tier.pricePerUnit', 'Price / unit')}</span>
        <span className="text-right">{t('create.tier.save', 'Save')}</span>
      </div>

      <ul className="grid gap-2">
        {tiers.map((tier, index) => {
          const discount =
            retail > 0 ? Math.round(((retail - tier.pricePerUnit) / retail) * 100) : 0;

          return (
            <li
              key={`tier-${index}`}
              className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[1fr_1fr_1fr_5.5rem] sm:items-center sm:border-transparent sm:bg-white sm:p-0"
            >
              <div className="grid gap-1">
                <MobileCaption>{`${t('create.tier.from', 'From')} (${metric})`}</MobileCaption>
                <NumberField
                  value={tier.min}
                  placeholder="0"
                  ariaLabel={`${t('create.tier.rowFrom', 'Tier')} ${index + 1} — ${t('create.tier.from', 'From')} (${metric})`}
                  onChange={(min) => replaceAt(index, { ...tier, min })}
                />
              </div>
              <div className="grid gap-1">
                <MobileCaption>{t('create.tier.upTo', 'Up to')}</MobileCaption>
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  className={INPUT}
                  value={tier.max === null ? '' : String(tier.max)}
                  placeholder={t('create.tier.noLimit', 'no limit')}
                  aria-label={`${t('create.tier.rowFrom', 'Tier')} ${index + 1} — ${t('create.tier.upTo', 'Up to')} (${metric})`}
                  onChange={(event) =>
                    replaceAt(index, {
                      ...tier,
                      max: event.target.value.trim() === '' ? null : toNumber(event.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-1">
                <MobileCaption>{t('create.tier.pricePerUnit', 'Price / unit')}</MobileCaption>
                <NumberField
                  value={tier.pricePerUnit}
                  step={0.01}
                  suffix="€"
                  ariaLabel={`${t('create.tier.rowFrom', 'Tier')} ${index + 1} — ${t('create.tier.pricePerUnit', 'Price / unit')}`}
                  onChange={(pricePerUnit) => replaceAt(index, { ...tier, pricePerUnit })}
                />
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span
                  className={`text-xs tabular-nums ${discount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}
                >
                  {discount > 0 ? `−${discount}%` : '—'}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={tiers.length <= 1}
                  aria-label={`${t('create.tier.remove', 'Remove tier')} ${index + 1}`}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-500 transition hover:border-rose-300 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {error !== undefined && (
        <p id="tiers-error" className={ERROR}>
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={GHOST_BUTTON} onClick={addTier}>
          {t('create.tier.add', '+ Add tier')}
        </button>
        <button type="button" className={GHOST_BUTTON} onClick={onReseed}>
          {t('create.tier.reseed', 'Reset from retail price')}
        </button>
      </div>
    </div>
  );
}

/** The column header, repeated per row on phones where the header row is hidden. */
function MobileCaption({ children }: { children: string }) {
  return (
    <span aria-hidden="true" className="text-xs text-slate-500 sm:hidden">
      {children}
    </span>
  );
}
