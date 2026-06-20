import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { useLegalData } from '../../lib/content';

export default function CookiePolicyPage() {
  const { t } = useTranslation();
  const legalData = useLegalData();
  const page = legalData.cookies;

  const reopenBanner = useCallback(() => {
    window.dispatchEvent(new Event('cloudie-reopen-cookies'));
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="16" />
        {t('legal.backHome')}
      </Link>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
        {page.title}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-12">
        Last updated: {new Date(page.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        {page.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
              {section.heading}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <iconify-icon icon="solar:cookie-linear" width="24" className="text-indigo-500 flex-shrink-0" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('cookie.manageDescription')}
          </p>
        </div>
        <button
          onClick={reopenBanner}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors whitespace-nowrap"
        >
          <iconify-icon icon="solar:settings-linear" width="16" />
          {t('cookie.manageButton')}
        </button>
      </div>
    </section>
  );
}
