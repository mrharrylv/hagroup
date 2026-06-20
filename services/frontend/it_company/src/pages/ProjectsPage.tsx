import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjectsData } from '../lib/content';
import ProjectCTA from '../components/sections/ProjectCTA';

const GRADIENTS = [
  'from-indigo-500 via-indigo-700 to-violet-900',
  'from-purple-500 via-purple-700 to-fuchsia-900',
  'from-cyan-500 via-teal-700 to-emerald-900',
  'from-rose-500 via-rose-700 to-pink-900',
  'from-amber-500 via-orange-700 to-red-900',
];

const ACCENT_COLORS = [
  'text-indigo-400',
  'text-purple-400',
  'text-cyan-400',
  'text-rose-400',
  'text-amber-400',
];

const ACCENT_BG = [
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
];

export default function ProjectsPage() {
  const { t } = useTranslation();
  const projects = useProjectsData();

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
          {t('projects.backHome')}
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
          {t('projects.title')}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          {t('projects.subtitle')}
        </p>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 gap-10">
          {projects.map((project, idx) => {
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const accentBg = ACCENT_BG[idx % ACCENT_BG.length];

            const card = (
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 transition-all duration-500 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 sm:group-hover:shadow-2xl sm:group-hover:shadow-zinc-300/25 dark:sm:group-hover:shadow-black/40 sm:group-hover:-translate-y-1">
                {/* Top visual panel */}
                <div className="relative aspect-[16/10] sm:aspect-[3/1] overflow-hidden">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} transition-transform duration-700 group-hover:scale-105`}>
                      {/* Decorative elements */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/[0.07] rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-white/[0.04] rounded-full blur-3xl" />
                        <div
                          className="absolute inset-0 opacity-[0.05]"
                          style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Overlay content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8">
                    {/* Top row: tags */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="hidden sm:block text-5xl sm:text-6xl font-black text-white/[0.12] leading-none select-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 sm:justify-end">
                        {project.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-md text-white/90 border border-white/15"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom row: title */}
                    <div>
                      <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                        {project.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Bottom content panel */}
                <div className="p-5 sm:p-8 space-y-4 sm:space-y-5">
                  {/* Role + Meta row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border ${accentBg}`}>
                      <iconify-icon icon="solar:code-bold" width="13" />
                      {project.role}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <iconify-icon icon="solar:calendar-linear" width="12" />
                        {project.year}
                      </span>
                      <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <iconify-icon icon="solar:clock-circle-linear" width="12" />
                        {project.duration}
                      </span>
                      <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <iconify-icon icon="solar:buildings-2-linear" width="12" />
                        {project.client}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Highlights */}
                  {project.highlights && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 sm:gap-y-2">
                      {project.highlights.slice(0, 4).map((hl: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] sm:text-sm text-zinc-600 dark:text-zinc-400">
                          <iconify-icon icon="solar:check-circle-bold" width="15" className={`${accent} mt-0.5 shrink-0`} />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Divider */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800" />

                  {/* Tech stack + visit */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="hidden sm:inline text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                          {project.technologies.slice(5).map((tech) => tech).join(' · ')}
                        </span>
                      )}
                      {project.technologies.length > 5 && (
                        <span className="sm:hidden text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/50">
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>
                    {project.website && (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${accent} shrink-0 transition-all sm:group-hover:gap-2.5`}>
                        {t('projects.visitSite')}
                        <iconify-icon icon="solar:arrow-right-up-linear" width="14" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return project.website ? (
              <a
                key={project.id}
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {card}
              </a>
            ) : (
              <div key={project.id} className="group block">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <ProjectCTA secondaryTo="/services" secondaryLabel={t('nav.services')} />
    </>
  );
}
