import { useI18n } from '../../i18n/useI18n';
import { Section } from './Section';

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      key: 'choose',
      title: t('home.how.1.title', 'Choose product and area'),
      body: t(
        'home.how.1.body',
        'Pick what you need — pellets, diesel, gravel, flour — and the radius you are willing to collect it in.',
      ),
    },
    {
      key: 'join',
      title: t('home.how.2.title', 'People join together'),
      body: t(
        'home.how.2.body',
        'Neighbours, farms and small businesses add their quantity to the same order until the volume is worth a supplier lorry.',
      ),
    },
    {
      key: 'unlock',
      title: t('home.how.3.title', 'Wholesale price unlocks'),
      body: t(
        'home.how.3.body',
        'Each volume tier drops the unit price for everyone in the group, including the people who joined first.',
      ),
    },
  ];

  return (
    <Section
      title={t('home.how.title', 'How it works')}
      lead={t('home.how.lead', 'Three steps, no membership, no fee for joining.')}
    >
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.key} className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="bg-brand-100 text-brand-800 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
              {index + 1}
            </span>
            <h3 className="mt-3 text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
