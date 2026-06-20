import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useProjectsData } from '../../lib/content';
import HorizontalCards from '../ui/HorizontalCards';

export default function Work() {
  const { t } = useTranslation();
  const projects = useProjectsData();
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="work" className="relative overflow-hidden py-12 sm:py-16 bg-zinc-50/80 dark:bg-zinc-900/30 border-y border-zinc-200/70 dark:border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">
              {t('work.titlePrefix')}{' '}
              <span className="text-indigo-600 dark:text-indigo-400">{t('work.titleAccent')}</span>
            </h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
              {t('work.subtitle')}
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {t('work.viewAll')} <iconify-icon icon="solar:arrow-right-linear" width="16" />
          </Link>
        </div>
      </div>

      <HorizontalCards
        items={featured}
        keyExtractor={(project) => project.id}
        renderCard={(project) => (
          <>
            {project.image && (
              <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
            )}
            {/* Icon watermark */}
            <div className="absolute top-6 right-6 opacity-10">
              <iconify-icon icon="solar:code-square-linear" width="80" style={{ color: 'white' }} />
            </div>
            {/* Bottom gradient */}
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span key={tech} className="text-xs px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm text-white/80 border border-white/10">{tech}</span>
                ))}
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                {project.title}
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            </div>
          </>
        )}
      />
    </section>
  );
}
