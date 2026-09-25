import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * Shown for any URL the site does not have. Layout's Seo resolves the same
 * URL to the not-found copy and marks it noindex, so a mistyped link is a
 * real "not found", not a copy of the home page. `data-not-found` lets the
 * prerender notice a real route that fell through to here.
 */
export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section data-not-found="true" className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
      <p className="text-sm font-semibold tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">404</p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
        {t('notFound.title')}
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10">
        {t('notFound.text')}
      </p>
      <nav className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors shadow-sm"
        >
          <iconify-icon icon="solar:home-2-linear" width="16" />
          {t('notFound.homeLink')}
        </Link>
        <Link
          to="/services"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {t('notFound.servicesLink')}
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {t('notFound.contactLink')}
        </Link>
      </nav>
    </section>
  );
}
