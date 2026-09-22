import { useI18n } from '../../i18n/useI18n';
import { PrimaryLink, SecondaryLink } from './Section';

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="bg-brand-50 ring-brand-100 rounded-2xl px-6 py-12 ring-1 sm:px-10 sm:py-16">
      <p className="text-brand-700 text-xs font-semibold tracking-widest uppercase">
        {t('home.hero.eyebrow', 'Kopā · Latvia')}
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-bold text-slate-900 sm:text-5xl">
        {t('home.hero.headline', 'Buy together. Pay wholesale.')}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">
        {t(
          'home.hero.subline',
          "Latvia's group buying platform for fuel, pellets, building materials and more.",
        )}
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <PrimaryLink to="/map">{t('home.hero.browse', 'Browse group buys')}</PrimaryLink>
        <SecondaryLink to="/start">{t('home.hero.start', 'Start a group buy')}</SecondaryLink>
      </div>

      <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200 ring-inset">
        <span aria-hidden="true">⚠️</span>
        {t('home.hero.demo', 'Concept demo — all data is invented')}
      </p>
    </section>
  );
}
