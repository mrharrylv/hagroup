import { useI18n } from '../../i18n/useI18n';
import { HEADING_CLASS, PANEL_CLASS, SECTION_CLASS } from './styles';

/** The argument for selling into a group, one card per reason. */
const WHY_CARDS = [
  {
    key: 'concentrated',
    icon: '🎯',
    title: ['suppliers.why.1.title', 'Concentrated demand'],
    body: [
      'suppliers.why.1.body',
      'One campaign instead of forty scattered enquiries, each of which needed its own quote.',
    ],
  },
  {
    key: 'sales-effort',
    icon: '📉',
    title: ['suppliers.why.2.title', 'Less sales effort per euro'],
    body: [
      'suppliers.why.2.body',
      'No cold calls, no site visits to win a single pallet. The buyers have already gathered.',
    ],
  },
  {
    key: 'order-size',
    icon: '🧮',
    title: ['suppliers.why.3.title', 'Larger consolidated orders'],
    body: [
      'suppliers.why.3.body',
      'Committed volume arrives as one order, so it is worth quoting a real wholesale price.',
    ],
  },
  {
    key: 'logistics',
    icon: '🚚',
    title: ['suppliers.why.4.title', 'Lower logistics cost per unit'],
    body: [
      'suppliers.why.4.body',
      'One route serves many buyers in the same area, so the delivery cost splits across the load.',
    ],
  },
  {
    key: 'real-demand',
    icon: '✅',
    title: ['suppliers.why.5.title', 'Bid on demand that exists'],
    body: [
      'suppliers.why.5.body',
      'You price against confirmed commitments rather than forecasting what a season might bring.',
    ],
  },
] as const;

export function WhySuppliersWin() {
  const { t } = useI18n();

  return (
    <section className={SECTION_CLASS} aria-labelledby="why-suppliers">
      <h2 id="why-suppliers" className={HEADING_CLASS}>
        {t('suppliers.why.title', 'Why suppliers win')}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_CARDS.map((card) => (
          <article key={card.key} className={`${PANEL_CLASS} p-5`}>
            <span className="text-xl" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              {t(card.title[0], card.title[1])}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{t(card.body[0], card.body[1])}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
