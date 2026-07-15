import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCTA from '../../components/sections/ProjectCTA';

const AUDIENCE_ICONS = [
  'solar:user-id-bold',
  'solar:users-group-two-rounded-bold',
  'solar:buildings-2-bold',
  'solar:pen-bold',
];

export default function BalticGPPage() {
  const { t } = useTranslation();
  const problemPoints = t('balticGP.problemPoints', { returnObjects: true }) as string[];
  const audiencePoints = t('balticGP.audiencePoints', { returnObjects: true }) as string[];
  const features = t('balticGP.features', { returnObjects: true }) as string[];
  const trustPoints = t('balticGP.trustPoints', { returnObjects: true }) as string[];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16" />
          {t('projects.backToWork')}
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1.5 mb-5">
          <iconify-icon icon="solar:flag-2-bold" width="14" />
          {t('balticGP.badge')}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
          BalticGP
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {t('balticGP.description')}
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">{t('balticGP.problemTitle')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              {t('balticGP.problemText')}
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {problemPoints.map((point) => (
                <li key={point} className="flex items-start gap-2"><iconify-icon icon="solar:check-circle-bold" width="16" className="mt-0.5 text-indigo-500 shrink-0" />{point}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">{t('balticGP.audienceTitle')}</h2>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              {audiencePoints.map((point, index) => (
                <li key={point} className="flex items-start gap-2"><iconify-icon icon={AUDIENCE_ICONS[index]} width="16" className="mt-0.5 text-indigo-500 shrink-0" />{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-5">{t('balticGP.featuresTitle')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((item) => (
              <div key={item} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <iconify-icon icon="solar:star-bold" width="14" className="mt-0.5 text-indigo-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-5">{t('balticGP.trustTitle')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {trustPoints.map((item) => (
              <div key={item} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <iconify-icon icon="solar:shield-check-bold" width="14" className="mt-0.5 text-indigo-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProjectCTA secondaryTo="/projects" secondaryLabel={t('projects.backToWork')} />
    </>
  );
}
