import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useServicesData } from '../../lib/content';
import ProjectCTA from './ProjectCTA';

interface ServicePageProps {
  serviceKey: string;
  ctaSection?: boolean;
}

interface ServicePageData {
  icon: string;
  title: string;
  subtitle: string;
  overviewTitle: string;
  overviewText: string;
  stats: { value: string; label: string }[];
  featuresTitle: string;
  features: { icon: string; title: string; description: string }[];
  processTitle: string;
  process: { step: string; title: string; description: string }[];
  techTitle: string;
  technologies: { name: string; icon: string }[];
  ctaTitle: string;
  ctaText: string;
}

export default function ServicePage({ serviceKey, ctaSection = true }: ServicePageProps) {
  const { t } = useTranslation();
  const servicesData = useServicesData();

  const page = (servicesData.pages as Record<string, ServicePageData>)[serviceKey];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!page) return null;

  return (
    <>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16" />
          {t('servicePages.backToServices')}
        </Link>

        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <iconify-icon icon={page.icon} width="28" className="sm:hidden" />
            <iconify-icon icon={page.icon} width="32" className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
              {page.title}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {page.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-6">
              {page.overviewTitle}
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {page.overviewText}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {page.stats.map(
              (stat: { value: string; label: string }, i: number) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.03]"
                >
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features / What We Offer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-12">
          {page.featuresTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {page.features.map((f: { icon: string; title: string; description: string }) => (
            <div
              key={f.title}
              className="group p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <iconify-icon icon={f.icon} width="24" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-12">
          {page.processTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {page.process.map(
            (step: { step: string; title: string; description: string }, i: number) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.03]">
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 transition-colors duration-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-300">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Technologies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-8">
          {page.techTitle}
        </h2>
        <div className="flex flex-wrap gap-3">
          {page.technologies.map((tech: { name: string; icon: string }) => (
            <span
              key={tech.name}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <iconify-icon icon={tech.icon} width="18" />
              {tech.name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      {ctaSection && <ProjectCTA showContactButton={false} />}
    </>
  );
}
