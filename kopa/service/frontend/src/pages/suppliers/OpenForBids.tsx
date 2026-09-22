import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cityById } from '../../data/cities';
import { regionById } from '../../data/regions';
import { formatMoney, formatNumber } from '../../domain/dates';
import { useI18n } from '../../i18n/useI18n';
import { CategoryIcon } from '../../components/CategoryIcon';
import { EMPTY_BID, bidSummary, type BidForm } from './bidForm';
import type { BidTarget } from './demand';
import { Field } from './fields';
import { unitLong, unitShort } from './labels';
import {
  BTN_OUTLINE,
  BTN_PRIMARY,
  BTN_SUBTLE,
  EMPTY_CLASS,
  HEADING_CLASS,
  NOTICE_CLASS,
  PANEL_CLASS,
  SECTION_CLASS,
  SECTION_HEAD_CLASS,
  SECTION_NOTE_CLASS,
} from './styles';

/** Every form on this page is per-campaign, so the state is keyed by campaign id. */
type BidState = Readonly<Record<string, BidForm | undefined>>;

interface BidHandlers {
  readonly onOpen: () => void;
  readonly onEdit: (patch: Partial<BidForm>) => void;
  readonly onClose: () => void;
}

/** Where the campaign is, as one line: city, then region when we know it. */
function LocationLine({ target }: { target: BidTarget }) {
  const { loc } = useI18n();
  const { campaign } = target;
  const city = cityById(campaign.cityId);
  const region = regionById(campaign.regionId);

  return (
    <p className="text-xs text-slate-500">
      {city?.name ?? campaign.cityId}
      {region !== undefined && ` · ${loc(region.name)}`}
    </p>
  );
}

/** The four numbers a supplier prices against. */
function BidStats({ target }: { target: BidTarget }) {
  const { t, lang } = useI18n();
  const unit = unitShort(target.campaign.unit, lang);
  const units = unitLong(target.campaign.unit, lang);

  const stats: readonly (readonly [string, string])[] = [
    [
      t('suppliers.bids.volume', 'Committed'),
      `${formatNumber(target.committedUnits, lang)} ${units}`,
    ],
    [t('suppliers.bids.buyers', 'Buyers'), formatNumber(target.buyerCount, lang)],
    [t('suppliers.bids.price', 'Price now'), `${formatMoney(target.currentPrice, lang)} / ${unit}`],
    [t('suppliers.bids.existing', 'Bids so far'), formatNumber(target.openBids, lang)],
  ];

  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
      {stats.map(([label, value]) => (
        <div key={label}>
          <dt className="text-slate-500">{label}</dt>
          <dd className="text-sm font-semibold text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The inline mock bid form. Nothing is sent anywhere; the card just echoes it back. */
function BidFields({
  campaignId,
  form,
  onEdit,
  onClose,
}: { campaignId: string; form: BidForm } & Pick<BidHandlers, 'onEdit' | 'onClose'>) {
  const { t } = useI18n();

  return (
    <form
      className="space-y-3"
      aria-label={t('suppliers.bids.formLabel', 'Submit a bid')}
      onSubmit={(event) => {
        event.preventDefault();
        onEdit({ sent: true });
      }}
    >
      <Field
        id={`bid-supplier-${campaignId}`}
        label={t('suppliers.bids.supplier', 'Supplier name')}
        value={form.supplier}
        onChange={(supplier) => onEdit({ supplier })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          id={`bid-price-${campaignId}`}
          label={t('suppliers.bids.pricePerUnit', 'Price per unit (EUR)')}
          type="number"
          min="0"
          step="0.01"
          value={form.pricePerUnit}
          onChange={(pricePerUnit) => onEdit({ pricePerUnit })}
        />
        <Field
          id={`bid-lead-${campaignId}`}
          label={t('suppliers.bids.leadTime', 'Lead time (days)')}
          type="number"
          min="0"
          step="1"
          value={form.leadTimeDays}
          onChange={(leadTimeDays) => onEdit({ leadTimeDays })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY}>
          {t('suppliers.bids.send', 'Send bid')}
        </button>
        <button type="button" onClick={onClose} className={BTN_SUBTLE}>
          {t('suppliers.bids.cancel', 'Cancel')}
        </button>
      </div>
    </form>
  );
}

function BidReceipt({ form, unit }: { form: BidForm; unit: string }) {
  const { t, lang } = useI18n();

  return (
    <p className={NOTICE_CLASS} role="status">
      {t('suppliers.bids.received', 'Bid received — the organiser will be notified.')}
      <span className="mt-1 block text-xs text-emerald-700">
        {bidSummary(form, unit, t('suppliers.bids.daysShort', 'd'), lang)}
      </span>
    </p>
  );
}

function BidCard({
  target,
  form,
  onOpen,
  onEdit,
  onClose,
}: { target: BidTarget; form: BidForm | undefined } & BidHandlers) {
  const { t, lang, loc } = useI18n();
  const { campaign } = target;

  return (
    <article className={`flex flex-col ${PANEL_CLASS} p-5`}>
      <div className="flex items-start gap-3">
        <CategoryIcon category={campaign.category} size="sm" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">
            <Link
              to={`/campaigns/${campaign.slug}`}
              className="hover:text-brand-700 hover:underline focus:ring-2 focus:ring-brand-300 focus:outline-none"
            >
              {loc(campaign.title)}
            </Link>
          </h3>
          <LocationLine target={target} />
        </div>
      </div>

      <BidStats target={target} />

      <div className="mt-4 grow" />

      {form === undefined && (
        <button type="button" onClick={onOpen} className={BTN_OUTLINE}>
          {t('suppliers.bids.submit', 'Submit a bid')}
        </button>
      )}

      {form !== undefined && form.sent && (
        <BidReceipt form={form} unit={unitShort(campaign.unit, lang)} />
      )}

      {form !== undefined && !form.sent && (
        <BidFields campaignId={campaign.id} form={form} onEdit={onEdit} onClose={onClose} />
      )}
    </article>
  );
}

/** The shortlist of campaigns still short of supplier interest, biggest volume first. */
export function OpenForBids({ targets }: { targets: readonly BidTarget[] }) {
  const { t } = useI18n();
  const [bids, setBids] = useState<BidState>({});

  const openBidForm = (id: string) => setBids((prev) => ({ ...prev, [id]: EMPTY_BID }));

  const closeBidForm = (id: string) =>
    setBids((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)));

  const editBid = (id: string, patch: Partial<BidForm>) =>
    setBids((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_BID), ...patch } }));

  return (
    <section className={SECTION_CLASS} aria-labelledby="open-for-bids">
      <div className={SECTION_HEAD_CLASS}>
        <h2 id="open-for-bids" className={HEADING_CLASS}>
          {t('suppliers.bids.title', 'Open for bids')}
        </h2>
        <p className={SECTION_NOTE_CLASS}>
          {t('suppliers.bids.note', 'Biggest volumes with little or no supplier interest yet.')}
        </p>
      </div>

      {targets.length === 0 ? (
        <p className={EMPTY_CLASS}>
          {t('suppliers.bids.empty', 'Every open campaign already has supplier bids on the table.')}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {targets.map((target) => (
            <BidCard
              key={target.campaign.id}
              target={target}
              form={bids[target.campaign.id]}
              onOpen={() => openBidForm(target.campaign.id)}
              onEdit={(patch) => editBid(target.campaign.id, patch)}
              onClose={() => closeBidForm(target.campaign.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
