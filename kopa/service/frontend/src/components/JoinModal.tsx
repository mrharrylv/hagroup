import { useEffect, useId, useRef, useState } from 'react';
import { unitById } from '../data/taxonomy';
import { formatMoney, formatNumber } from '../domain/dates';
import { pricingSnapshot } from '../domain/pricing';
import { totalsFor } from '../domain/status';
import { useI18n } from '../i18n/useI18n';
import { useKopa } from '../state/useKopa';
import type { BuyerType, Campaign } from '../domain/types';

/**
 * Demo join form. Nothing is sent anywhere — the commitment is written to
 * localStorage and the campaign's progress re-renders from it.
 */
export function JoinModal({
  campaign,
  onClose,
  onJoined,
}: {
  campaign: Campaign;
  onClose: () => void;
  onJoined?: (units: number) => void;
}) {
  const { lang, t, loc } = useI18n();
  const { joinCampaign } = useKopa();
  const fieldId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<BuyerType>('individual');
  const [org, setOrg] = useState('');
  const [units, setUnits] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const unit = unitById(campaign.unit);
  const totals = totalsFor(campaign, campaign.participants);
  const preview = totalsFor(campaign, [
    ...campaign.participants,
    { id: 'preview', name: 'preview', type, units, joinedDaysAgo: 0 },
  ]);
  const before = pricingSnapshot(campaign, totals);
  const after = pricingSnapshot(campaign, preview);
  const unlocksTier = after.current.pricePerUnit < before.current.pricePerUnit;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      setError(t('join.errName', 'Enter a name of at least two characters.'));
      return;
    }
    if (!Number.isFinite(units) || units <= 0) {
      setError(t('join.errUnits', 'Enter a quantity greater than zero.'));
      return;
    }
    if (type === 'business' && org.trim() === '') {
      setError(t('join.errOrg', 'Add the company name, or join as an individual.'));
      return;
    }

    joinCampaign(campaign.id, { name, type, org: org.trim(), units });
    onJoined?.(units);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('join.title', 'Join this group buy')}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('join.title', 'Join this group buy')}
            </h2>
            <p className="text-sm text-slate-500">{loc(campaign.title)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t('cta.close', 'Close')}
          >
            ✕
          </button>
        </div>

        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {t(
            'join.demoNotice',
            'Demo only — nothing is ordered, charged or sent. Your commitment is stored in this browser.',
          )}
        </p>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['individual', 'business'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === option
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {option === 'individual'
                  ? t('audience.individual', 'Individual')
                  : t('audience.business', 'Business')}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor={`${fieldId}-name`} className="block text-sm font-medium text-slate-700">
              {t('join.name', 'Your name')}
            </label>
            <input
              id={`${fieldId}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="focus:border-brand-500 focus:ring-brand-500 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              placeholder="Jānis"
              autoComplete="off"
            />
          </div>

          {type === 'business' && (
            <div>
              <label htmlFor={`${fieldId}-org`} className="block text-sm font-medium text-slate-700">
                {t('join.company', 'Company')}
              </label>
              <input
                id={`${fieldId}-org`}
                value={org}
                onChange={(event) => setOrg(event.target.value)}
                className="focus:border-brand-500 focus:ring-brand-500 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                placeholder="SIA Kopā"
                autoComplete="off"
              />
            </div>
          )}

          <div>
            <label
              htmlFor={`${fieldId}-units`}
              className="block text-sm font-medium text-slate-700"
            >
              {t('join.quantity', 'Quantity')} ({unit?.long[lang] ?? campaign.unit})
            </label>
            <input
              id={`${fieldId}-units`}
              type="number"
              min={0.1}
              step="any"
              value={units}
              onChange={(event) => setUnits(Number(event.target.value))}
              className="focus:border-brand-500 focus:ring-brand-500 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{t('join.yourPrice', 'Your price')}</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(after.current.pricePerUnit, lang)} /{' '}
                {unit?.short[lang] ?? campaign.unit}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-600">{t('join.yourTotal', 'Your total')}</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(after.current.pricePerUnit * units, lang)}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-600">{t('join.yourSaving', 'You save')}</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {formatMoney(
                  Math.max(0, (campaign.retailPricePerUnit - after.current.pricePerUnit) * units),
                  lang,
                )}
              </span>
            </div>
            {unlocksTier && (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                {t('join.unlocks', 'This commitment unlocks the next price tier for everyone.')}
              </p>
            )}
            {!unlocksTier && after.toNext !== null && after.next !== null && (
              <p className="mt-2 text-xs text-amber-800">
                {formatNumber(after.toNext, lang)}{' '}
                {campaign.tierBasis === 'buyers'
                  ? t('join.moreBuyers', 'more buyers')
                  : (unit?.long[lang] ?? campaign.unit)}{' '}
                {t('tier.toUnlock', 'to unlock')} {formatMoney(after.next.pricePerUnit, lang)}
              </p>
            )}
          </div>

          {error !== null && (
            <p role="alert" className="text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('cta.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 flex-[2] rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t('cta.joinGroupBuy', 'Join group buy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
