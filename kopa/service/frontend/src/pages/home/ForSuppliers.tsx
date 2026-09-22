import { useI18n } from '../../i18n/useI18n';
import { MoreLink, Section } from './Section';

export function ForSuppliers() {
  const { t } = useI18n();

  const points = [
    {
      key: 'demand',
      title: t('home.suppliers.1.title', 'Demand arrives concentrated'),
      body: t(
        'home.suppliers.1.body',
        'One group buy is one enquiry with a known volume, a known area and a known closing date.',
      ),
    },
    {
      key: 'effort',
      title: t('home.suppliers.2.title', 'Less fragmented sales effort'),
      body: t(
        'home.suppliers.2.body',
        'Quote once for forty buyers instead of chasing forty separate phone calls.',
      ),
    },
    {
      key: 'orders',
      title: t('home.suppliers.3.title', 'Larger consolidated orders'),
      body: t(
        'home.suppliers.3.body',
        'Groups commit to full pallets and full loads, so the order matches how you actually ship.',
      ),
    },
    {
      key: 'logistics',
      title: t('home.suppliers.4.title', 'Lower logistics cost per unit'),
      body: t(
        'home.suppliers.4.body',
        'Buyers in one radius mean one route and one delivery window, not scattered drops.',
      ),
    },
    {
      key: 'bid',
      title: t('home.suppliers.5.title', 'Bid on live demand'),
      body: t(
        'home.suppliers.5.body',
        'See what is being pooled right now and put a price against it before it closes.',
      ),
    },
  ];

  return (
    <Section
      title={t('home.suppliers.title', 'For suppliers')}
      lead={t('home.suppliers.lead', 'Why sell into a group instead of one buyer at a time.')}
      action={<MoreLink to="/suppliers">{t('home.suppliers.more', 'Supplier view')}</MoreLink>}
      className="bg-brand-50 ring-brand-100 rounded-2xl px-6 ring-1 sm:px-8"
    >
      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {points.map((point) => (
          <div key={point.key}>
            <dt className="text-sm font-semibold text-slate-900">{point.title}</dt>
            <dd className="mt-1 text-sm text-slate-700">{point.body}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
