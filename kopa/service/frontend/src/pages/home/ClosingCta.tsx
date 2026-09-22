import { useI18n } from '../../i18n/useI18n';
import { PrimaryLink, SecondaryLink } from './Section';

export function ClosingCta() {
  const { t } = useI18n();

  return (
    <section className="py-12">
      <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-10 sm:px-10">
        <p className="max-w-2xl text-lg font-medium text-slate-900 sm:text-xl">
          {t(
            'home.closing.line',
            'Find a group buy near you, or start one and let your neighbours fill it.',
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <PrimaryLink to="/map">{t('home.hero.browse', 'Browse group buys')}</PrimaryLink>
          <SecondaryLink to="/start">{t('home.hero.start', 'Start a group buy')}</SecondaryLink>
        </div>
      </div>
    </section>
  );
}
