import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import CareerContact from '../components/sections/CareerContact';
import { useCareersData } from '../lib/content';

export default function CareersPage() {
  const { t } = useTranslation();
  const careersData = useCareersData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16" />
          {t('careers.backHome')}
        </Link>

        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-6 max-w-3xl">
            {careersData.title}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {careersData.subtitle}
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            {careersData.benefitsTitle}
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {careersData.benefitsSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {careersData.benefits.map((benefit) => (
            <div
              key={benefit.key}
              className="group relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <iconify-icon icon={benefit.icon} width="24" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            {careersData.positionsTitle}
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {careersData.positionsSubtitle}
          </p>
        </div>
        <div className="space-y-4">
          {careersData.positions.map((pos) => (
            <div
              key={pos.key}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <iconify-icon icon={pos.icon} width="24" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                    {pos.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {pos.location}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {pos.type}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {pos.department}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href="#career-form"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shrink-0"
              >
                {t('careers.applyNow')}
                <iconify-icon icon="solar:arrow-right-linear" width="16" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Career Contact Form */}
      <div id="career-form">
        <CareerContact />
      </div>
    </>
  );
}
