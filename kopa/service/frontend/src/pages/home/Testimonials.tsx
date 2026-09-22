import { useI18n } from '../../i18n/useI18n';
import { Section } from './Section';

export function Testimonials() {
  const { t } = useI18n();

  const quotes = [
    {
      key: 'diesel',
      quote: t(
        'home.quote.1',
        'Eleven farms around Bauska ordered diesel on one delivery. We each saved about nine cents a litre and the lorry only had to come once.',
      ),
      name: 'Jānis Bērziņš',
      role: t('home.quote.1.role', 'Grain farmer'),
      town: 'Bauska, Zemgale',
    },
    {
      key: 'pellets',
      quote: t(
        'home.quote.2',
        'I needed four pallets of pellets, which nobody wants to deliver. Twenty-three of us in Mārupe ordered together and it came the same week.',
      ),
      name: 'Ilze Kalniņa',
      role: t('home.quote.2.role', 'Homeowner'),
      town: 'Mārupe, Pierīga',
    },
    {
      key: 'oil',
      quote: t(
        'home.quote.3',
        'Six restaurants in Rīga buy olive oil and flour on the same order now. The wholesale tier is the one we could never reach alone.',
      ),
      name: 'Kristaps Ozoliņš',
      role: t('home.quote.3.role', 'Restaurant owner'),
      town: 'Rīga',
    },
    {
      key: 'timber',
      quote: t(
        'home.quote.4',
        'Building my own house, I joined a timber group buy with neighbours from two parishes. The price per cubic metre dropped twice while I waited.',
      ),
      name: 'Anete Liepa',
      role: t('home.quote.4.role', 'Self-builder'),
      town: 'Valmiera, Vidzeme',
    },
  ];

  return (
    <Section
      title={t('home.quotes.title', 'What people say')}
      lead={t('home.quotes.lead', 'How a group buy feels from the buyer side.')}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quotes.map((entry) => (
          <figure key={entry.key} className="rounded-xl border border-slate-200 bg-white p-5">
            <blockquote className="text-sm leading-relaxed text-slate-700">
              “{entry.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold text-slate-900">{entry.name}</span>
              <span className="block text-slate-500">
                {entry.role} · {entry.town}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-4 text-xs text-amber-800">
        {t(
          'home.quotes.caption',
          'Illustrative only — these quotes and people are invented for the demo and are not real customers.',
        )}
      </p>
    </Section>
  );
}
