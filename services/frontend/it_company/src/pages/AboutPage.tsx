import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function AboutPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="16" />
        {t('about.backHome')}
      </Link>

      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-6 max-w-3xl">
          {t('about.title')}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-16">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="group p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 transition-transform duration-300 group-hover:scale-110">
            <iconify-icon icon="solar:target-linear" width="24" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">{t('about.mission.title')}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{t('about.mission.text')}</p>
        </div>
        <div className="group p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 transition-transform duration-300 group-hover:scale-110">
            <iconify-icon icon="solar:eye-linear" width="24" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">{t('about.vision.title')}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{t('about.vision.text')}</p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-8 text-center">
          {t('about.values.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['transparency', 'excellence', 'innovation', 'partnership'] as const).map((key) => (
            <div key={key} className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 text-center transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.03]">
              <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 transition-transform duration-300 group-hover:scale-110">
                <iconify-icon icon={t(`about.values.${key}.icon`)} width="20" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">{t(`about.values.${key}.title`)}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t(`about.values.${key}.text`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl sm:rounded-3xl bg-indigo-600 dark:bg-indigo-500 p-8 sm:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          {t('about.ctaTitle')}
        </h2>
        <p className="text-base text-indigo-100 mb-8 max-w-2xl mx-auto">
          {t('about.ctaText')}
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
        >
          {t('about.ctaButton')}
          <iconify-icon icon="solar:arrow-right-linear" width="16" />
        </Link>
      </div>
    </section>
  );
}
