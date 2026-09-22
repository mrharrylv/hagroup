import { useI18n } from '../../i18n/useI18n';
import { HEADING_CLASS, PANEL_CLASS, SECTION_CLASS } from './styles';

/** The four steps between a commitment and a delivery, in order. */
const HOW_STEPS = [
  ['suppliers.how.1', 'Demand accumulates as buyers commit units to a campaign.'],
  ['suppliers.how.2', 'The organiser closes the campaign once the goal or the deadline is reached.'],
  ['suppliers.how.3', 'Suppliers bid on the confirmed volume — price per unit and lead time.'],
  ['suppliers.how.4', 'One delivery is scheduled, and each buyer is invoiced their share.'],
] as const;

export function HowABidWorks() {
  const { t } = useI18n();

  return (
    <section className={SECTION_CLASS} aria-labelledby="how-a-bid-works">
      <h2 id="how-a-bid-works" className={HEADING_CLASS}>
        {t('suppliers.how.title', 'How a bid works')}
      </h2>
      <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_STEPS.map(([key, english], index) => (
          <li key={key} className={`${PANEL_CLASS} p-5`}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
              {index + 1}
            </span>
            <p className="mt-2 text-sm text-slate-600">{t(key, english)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
