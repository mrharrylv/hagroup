import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ProjectCTAProps {
  /** Show the "Start a Project" (contact) button */
  showContactButton?: boolean;
  /** Label override for the secondary button (defaults to nav.ourWork) */
  secondaryLabel?: string;
  /** Link override for the secondary button (defaults to /projects) */
  secondaryTo?: string;
}

export default function ProjectCTA({
  showContactButton = true,
  secondaryLabel,
  secondaryTo = '/projects',
}: ProjectCTAProps) {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-500 dark:via-violet-500 dark:to-purple-600 px-8 sm:px-16 py-20 sm:py-24">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-violet-500/10 rounded-full blur-3xl" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative flex flex-col items-center text-center">
          {/* Icon badge */}
          <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
            <iconify-icon icon="solar:rocket-bold-duotone" width="32" className="text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {t('projects.ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-indigo-100/90 max-w-xl mx-auto mb-10 leading-relaxed">
            {t('projects.ctaText')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {showContactButton && (
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-semibold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 transition-all duration-200 shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-900/40 hover:-translate-y-0.5"
              >
                {t('projects.ctaButton')}
                <iconify-icon
                  icon="solar:arrow-right-linear"
                  width="16"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            )}
            <Link
              to={secondaryTo}
              className={
                showContactButton
                  ? 'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-200'
                  : 'group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-semibold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 transition-all duration-200 shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-900/40 hover:-translate-y-0.5'
              }
            >
              {secondaryLabel ?? t('nav.ourWork')}
              {!showContactButton && (
                <iconify-icon
                  icon="solar:arrow-right-linear"
                  width="16"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              )}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
