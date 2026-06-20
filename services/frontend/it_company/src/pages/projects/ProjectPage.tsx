import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjectsData, type Project } from '../../lib/content';
import ProjectCTA from '../../components/sections/ProjectCTA';

/* ── EventApp-specific demo data ── */
const MOCK_EVENTS = [
  { title: 'DONS | TUVUMS', date: '15. Aug, 20:00', city: 'Rīga', price: '€45', tags: ['Mūzika', 'Pārim'], color: 'from-purple-500 to-indigo-600' },
  { title: 'Nurme Springs 2026', date: '25. Apr, 16:00', city: 'Rīga', price: '€55', tags: ['Festivāls', 'Dzērieni'], color: 'from-amber-500 to-orange-600' },
  { title: 'OZOLS — Cieņa un Mīlestība', date: '5. Dec, 20:00', city: 'Rīga', price: '€29', tags: ['Mūzika'], color: 'from-rose-500 to-pink-600' },
  { title: 'Latvija — Norvēģija', date: '6. May, 19:30', city: 'Rīga', price: '€3.50', tags: ['Sports', 'Ģimene'], color: 'from-emerald-500 to-teal-600' },
  { title: 'Chris Noah Siguldā', date: '6. Jun, 20:00', city: 'Sigulda', price: '€30', tags: ['Mūzika', 'Dabā'], color: 'from-sky-500 to-blue-600' },
  { title: 'ĀrprāTS S11 E8', date: '8. May, 19:30', city: 'Rīga', price: '€10', tags: ['Komēdija', 'Teātris'], color: 'from-violet-500 to-fuchsia-600' },
];

const CATEGORIES = ['Mūzika', 'Sports', 'Teātris', 'Festivāls', 'Komēdija', 'Izklaide', 'Ģimene', 'Dabā', 'Dzērieni', 'Kultūra', 'Kino', 'Deja'];

/* ── Gradient initials helper ── */
function getInitials(title: string): string {
  return title
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/* ── EventApp visual mockup ── */
function EventAppMockup() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl">
        {/* Browser chrome */}
        <div className="h-10 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
          <div className="ml-4 flex-1 max-w-md">
            <div className="h-6 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center px-3">
              <span className="text-[10px] text-zinc-400 select-none">eventapp.lv</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
            <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">EventApp</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Visi pasākumi</span>
            <span>Mani Plāni</span>
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center px-3 gap-2">
            <iconify-icon icon="solar:magnifer-linear" width="14" className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Meklēt pasākumus…</span>
          </div>
          <div className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <iconify-icon icon="solar:map-point-linear" width="14" className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Kur</span>
          </div>
          <div className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <iconify-icon icon="solar:calendar-linear" width="14" className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Kad</span>
          </div>
        </div>

        {/* Category pills */}
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Featured hero banner */}
        <div className="mx-6 mb-6 rounded-2xl overflow-hidden relative h-44 md:h-56 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-end p-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-60" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-widest text-indigo-200 font-semibold">Izceltie pasākumi</span>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">Pasākumi Latvijā</h3>
            <p className="text-sm text-indigo-100 mt-1">Koncerti, Teātris, Festivāli, Izstādes Rīgā</p>
          </div>
        </div>

        {/* Event cards grid */}
        <div className="px-6 pb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Atklāj pasākumus</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_EVENTS.map((ev) => (
              <div
                key={ev.title}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/60 hover:shadow-lg transition-shadow"
              >
                <div className={`h-28 bg-gradient-to-br ${ev.color} relative`}>
                  <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/60 backdrop-blur rounded-md px-2 py-0.5 text-[11px] font-semibold text-zinc-900 dark:text-white">
                    {ev.price}
                  </div>
                </div>
                <div className="p-3">
                  <h5 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{ev.title}</h5>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {ev.city} · {ev.date}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {ev.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planning section */}
        <div className="mx-6 mb-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Sāc plānot</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <iconify-icon icon="solar:clipboard-list-linear" width="16" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Plāno kopā — bez konta</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Saglabā pasākumus pagaidu plānā, dalies ar saiti</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <iconify-icon icon="solar:bell-linear" width="16" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Seko kategorijām</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Saņem jaunumus par interesējošiem pasākumiem</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mock */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">© 2026 EventApp</span>
          <div className="flex gap-4 text-[10px] text-zinc-400">
            <span>Par mums</span>
            <span>Privātuma politika</span>
            <span>Sīkdatnes</span>
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

  const domain = project.website
    ? new URL(project.website).hostname.replace(/^www\./, '')
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
            {getInitials(project.title)}
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
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <iconify-icon icon="solar:calendar-linear" width="16" />
            <span className="font-medium text-zinc-900 dark:text-white">{project.year}</span>
          </div>
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
              href={project.website}
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
      {project.slug === 'event-app' && <EventAppMockup />}

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
