import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjectsData, type Project } from '../../lib/content';
import ProjectCTA from '../../components/sections/ProjectCTA';
import RokberPreview from '../../components/projects/RokberPreview';

/* ── Gradient initials helper ── */
function getInitials(title: string): string {
  return title
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function ConfidentialEventPlatformVisual() {
  const { t } = useTranslation();

  const sources = [
    { icon: 'solar:ticket-bold', label: t('projects.confidentialEventVisual.ticketing') },
    { icon: 'solar:buildings-2-bold', label: t('projects.confidentialEventVisual.venues') },
    { icon: 'solar:city-bold', label: t('projects.confidentialEventVisual.municipalities') },
  ];

  const pipeline = [
    {
      icon: 'solar:code-square-bold',
      title: t('projects.confidentialEventVisual.ingestionTitle'),
      text: t('projects.confidentialEventVisual.ingestionText'),
    },
    {
      icon: 'solar:stars-bold',
      title: t('projects.confidentialEventVisual.aiTitle'),
      text: t('projects.confidentialEventVisual.aiText'),
    },
    {
      icon: 'solar:filter-bold',
      title: t('projects.confidentialEventVisual.discoveryTitle'),
      text: t('projects.confidentialEventVisual.discoveryText'),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-slate-950 via-cyan-950 to-zinc-950 p-6 shadow-2xl sm:p-10">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                <iconify-icon icon="solar:lock-keyhole-minimalistic-bold" width="14" />
                {t('projects.ndaProtected')}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {t('projects.confidentialEventVisual.title')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                {t('projects.confidentialEventVisual.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                <iconify-icon icon="solar:shield-keyhole-bold" width="22" />
              </div>
              <div>
                <div className="mb-1.5 h-2 w-28 rounded-full bg-white/25" />
                <div className="h-2 w-20 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.5fr]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                    {t('projects.confidentialEventVisual.sourceLabel')}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white">20+</p>
                </div>
                <iconify-icon icon="solar:global-bold" width="28" className="text-cyan-300/80" />
              </div>
              <div className="space-y-2.5">
                {sources.map((source) => (
                  <div key={source.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs text-zinc-300">
                    <iconify-icon icon={source.icon} width="17" className="text-cyan-200" />
                    {source.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                {t('projects.confidentialEventVisual.pipelineLabel')}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {pipeline.map((stage, index) => (
                  <div key={stage.title} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                      <iconify-icon icon={stage.icon} width="21" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{stage.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{stage.text}</p>
                    {index < pipeline.length - 1 && (
                      <iconify-icon
                        icon="solar:arrow-right-linear"
                        width="18"
                        className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 text-cyan-200/40 sm:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-indigo-300/15 bg-indigo-400/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', '+'].map((label, index) => (
                  <div
                    key={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-indigo-400/80 to-cyan-400/70 text-[10px] font-bold text-white"
                    style={{ zIndex: 4 - index }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('projects.confidentialEventVisual.collaborationTitle')}</h3>
                <p className="mt-1 text-xs text-zinc-400">{t('projects.confidentialEventVisual.collaborationText')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-indigo-100/80">
              <span className="rounded-full border border-indigo-300/15 bg-indigo-300/10 px-3 py-1.5">{t('projects.confidentialEventVisual.sharedSessions')}</span>
              <span className="rounded-full border border-indigo-300/15 bg-indigo-300/10 px-3 py-1.5">{t('projects.confidentialEventVisual.groupVoting')}</span>
              <span className="rounded-full border border-indigo-300/15 bg-indigo-300/10 px-3 py-1.5">{t('projects.confidentialEventVisual.liveSync')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfidentialInfrastructureVisual() {
  const { t } = useTranslation();

  const deliveryLayers = [
    {
      icon: 'solar:shield-keyhole-bold',
      title: t('projects.confidentialVisual.securityTitle'),
      text: t('projects.confidentialVisual.securityText'),
    },
    {
      icon: 'solar:database-bold',
      title: t('projects.confidentialVisual.migrationTitle'),
      text: t('projects.confidentialVisual.migrationText'),
    },
    {
      icon: 'solar:clipboard-check-bold',
      title: t('projects.confidentialVisual.governanceTitle'),
      text: t('projects.confidentialVisual.governanceText'),
    },
  ];

  const regions = [
    {
      code: 'US',
      title: t('projects.confidentialVisual.usRegion'),
    },
    {
      code: 'EU',
      title: t('projects.confidentialVisual.euRegion'),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-300/15 bg-gradient-to-br from-slate-950 via-indigo-950 to-zinc-950 p-6 shadow-2xl sm:p-10">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                <iconify-icon icon="solar:lock-keyhole-minimalistic-bold" width="14" />
                {t('projects.ndaProtected')}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {t('projects.confidentialVisual.title')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                {t('projects.confidentialVisual.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <iconify-icon icon="solar:buildings-3-bold" width="24" className="text-indigo-300" />
              <div>
                <div className="mb-1 h-2 w-28 rounded-full bg-white/25" />
                <div className="h-2 w-20 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="mx-auto mb-4 max-w-xl rounded-2xl border border-indigo-300/20 bg-indigo-400/10 p-5 text-center shadow-lg shadow-indigo-950/40">
            <div className="mb-2 flex items-center justify-center gap-3 text-indigo-200">
              <iconify-icon icon="solar:code-square-bold" width="26" />
              <span className="font-semibold">Terraform IaC + Azure DevOps</span>
            </div>
            <p className="text-xs leading-relaxed text-indigo-100/65">
              {t('projects.confidentialVisual.controlPlane')}
            </p>
          </div>

          <div className="mx-auto h-6 w-px bg-gradient-to-b from-indigo-300/50 to-indigo-300/10" />

          <div className="grid gap-4 md:grid-cols-2">
            {regions.map((region) => (
              <div key={region.code} className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-bold tracking-widest text-white">
                      {region.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{region.title}</h3>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{t('projects.confidentialVisual.regionalDelivery')}</p>
                    </div>
                  </div>
                  <iconify-icon icon="solar:cloud-bold" width="24" className="text-cyan-300/80" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex min-w-24 flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-400/[0.07] px-3 py-3 text-xs font-medium text-cyan-100">
                    <iconify-icon icon="solar:server-square-cloud-bold" width="18" />
                    {t('projects.confidentialVisual.hub')}
                  </div>
                  <div className="h-px w-5 bg-cyan-300/30" />
                  <div className="grid flex-[1.25] grid-cols-2 gap-2">
                    {['DEV', 'TEST', 'PROD', '.NET'].map((spoke) => (
                      <div key={spoke} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-center text-[10px] font-semibold tracking-wide text-zinc-300">
                        {spoke}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {deliveryLayers.map((layer) => (
              <div key={layer.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200">
                  <iconify-icon icon={layer.icon} width="21" />
                </div>
                <h3 className="text-sm font-semibold text-white">{layer.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{layer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Highlight icons (generic) ── */
const HIGHLIGHT_ICONS = [
  'solar:magnifer-linear',
  'solar:clipboard-list-linear',
  'solar:card-linear',
  'solar:chart-2-linear',
  'solar:bolt-linear',
  'solar:globe-linear',
];

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const projects = useProjectsData();
  const project: Project | undefined = projects.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) return <Navigate to="/projects" replace />;

  const externalWebsite = project.website.startsWith('http') ? project.website : null;
  const domain = externalWebsite
    ? new URL(externalWebsite).hostname.replace(/^www\./, '')
    : null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16" />
          {t('projects.backToWork')}
        </Link>

        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
          {/* Logo mark */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
            {project.slug === 'confidential-infrastructure-modernization' || project.slug === 'confidential-event-intelligence-platform' ? (
              <iconify-icon icon="solar:shield-keyhole-bold" width="30" />
            ) : (
              getInitials(project.title)
            )}
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">
              {project.title}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <iconify-icon icon="solar:user-linear" width="16" />
            <span className="font-medium text-zinc-900 dark:text-white">{project.client}</span>
          </div>
          {project.year && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <iconify-icon icon="solar:calendar-linear" width="16" />
              <span className="font-medium text-zinc-900 dark:text-white">{project.year}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <iconify-icon icon="solar:clock-circle-linear" width="16" />
            <span className="font-medium text-zinc-900 dark:text-white">{project.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <iconify-icon icon="solar:code-linear" width="16" />
            <span className="font-medium text-zinc-900 dark:text-white">{project.role}</span>
          </div>
          {domain && (
            <a
              href={externalWebsite ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <iconify-icon icon="solar:link-round-linear" width="16" />
              {domain}
            </a>
          )}
        </div>
      </section>

      {/* ── Project-specific visual mockup ── */}
      {project.slug === 'confidential-event-intelligence-platform' && <ConfidentialEventPlatformVisual />}
      {project.slug === 'confidential-infrastructure-modernization' && <ConfidentialInfrastructureVisual />}

      {project.image && project.slug !== 'confidential-event-intelligence-platform' && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <a
            href={externalWebsite ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={domain ? `${project.title} — ${domain}` : project.title}
            className="group block overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-2xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              {project.slug === 'rokber' ? (
                <RokberPreview image={project.image} />
              ) : (
                <img
                  src={project.image}
                  alt={`${project.title} website`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              )}
            </div>
          </a>
        </section>
      )}

      {/* ── Key Highlights ── */}
      {project.highlights.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-10">
            {t('projects.keyHighlights')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.highlights.map((highlight, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <iconify-icon icon={HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]} width="24" />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{highlight}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Technology Stack ── */}
      {project.technologies.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-8">
            {t('projects.techStack')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 text-sm font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <ProjectCTA secondaryTo="/projects" secondaryLabel={t('nav.ourWork')} />
    </>
  );
}
