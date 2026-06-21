import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function CompanyDetailsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24">
      <Link
        to="/about"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
      >
        <iconify-icon icon="solar:arrow-left-linear" width="16" />
        {t('companyDetails.backToAbout')}
      </Link>

      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
          {t('companyDetails.title')}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {t('companyDetails.subtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-6 sm:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t('companyDetails.fields.companyName')}</p>
            <p className="text-sm text-zinc-900 dark:text-white">HAGroup SIA</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t('companyDetails.fields.regNumber')}</p>
            <p className="text-sm text-zinc-900 dark:text-white">40203XXXXXX</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t('companyDetails.fields.vatNumber')}</p>
            <p className="text-sm text-zinc-900 dark:text-white">LV40203XXXXXX</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t('companyDetails.fields.legalAddress')}</p>
            <p className="text-sm text-zinc-900 dark:text-white">Rīga, Latvia</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t('companyDetails.fields.bankLabel')}</p>
            <p className="text-sm text-zinc-900 dark:text-white">—</p>
          </div>
        </div>
      </div>
    </section>
  );
}
