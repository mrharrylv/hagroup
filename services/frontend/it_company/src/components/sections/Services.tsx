import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useServicesData } from '../../lib/content';
import SpotlightCard from '../ui/SpotlightCard';

export default function Services() {
  const { t } = useTranslation();
  const servicesData = useServicesData();

  return (
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-2xl mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
          {t('services.title')}
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          {t('services.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {servicesData.items.map((item) => (
          <SpotlightCard key={item.key} className="rounded-3xl">
            <Link
              to={item.path}
              className="group relative flex flex-col p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors duration-300 h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300">
                <iconify-icon icon={item.icon} width="24" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {item.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                {t('services.learnMore')}{' '}
                <iconify-icon icon="solar:arrow-right-linear" width="16" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
