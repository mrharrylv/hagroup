import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import ProjectCTA from '../../components/sections/ProjectCTA';

const PUBLIC_FEATURES = [
  'Browse upcoming races, trainings, and track days in one place',
  'Filter by track, organizer, country, and event type',
  'Open official source links for every listed event',
  'Save favorites locally and plan your season faster',
  'Check when event details were last updated',
];

const CONTRIBUTOR_AND_ADMIN = [
  'Contributors can submit events and track approval status',
  'Moderators review and approve submissions before publication',
  'Organizer admins can manage events related to their own organizer',
  'All moderation decisions are logged for transparency',
];

export default function BalticGPPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16" />
          Back to Projects
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1.5 mb-5">
          <iconify-icon icon="solar:flag-2-bold" width="14" />
          Motorcycle Road Racing Calendar
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
          BalticGP
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          A fast, reliable calendar app that helps riders and fans find official motorcycle road racing events across the Baltics and Europe.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">What It Solves</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Event information is often scattered across social media posts, PDFs, and separate organizer websites. BalticGP puts trusted event details in one place so people can plan with confidence.
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2"><iconify-icon icon="solar:check-circle-bold" width="16" className="mt-0.5 text-indigo-500" />One calendar instead of fragmented sources</li>
              <li className="flex items-start gap-2"><iconify-icon icon="solar:check-circle-bold" width="16" className="mt-0.5 text-indigo-500" />Clear event visibility for riders and spectators</li>
              <li className="flex items-start gap-2"><iconify-icon icon="solar:check-circle-bold" width="16" className="mt-0.5 text-indigo-500" />Reliable updates when dates or times change</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">Who It Is For</h2>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2"><iconify-icon icon="solar:user-id-bold" width="16" className="mt-0.5 text-indigo-500" />Road racing riders looking for upcoming events and registration links</li>
              <li className="flex items-start gap-2"><iconify-icon icon="solar:users-group-two-rounded-bold" width="16" className="mt-0.5 text-indigo-500" />Fans and spectators who want to know what is happening and where</li>
              <li className="flex items-start gap-2"><iconify-icon icon="solar:buildings-2-bold" width="16" className="mt-0.5 text-indigo-500" />Organizers who want neutral and trusted event visibility</li>
              <li className="flex items-start gap-2"><iconify-icon icon="solar:pen-bold" width="16" className="mt-0.5 text-indigo-500" />Contributors who help keep the calendar fresh and accurate</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-5">What Users Can Do</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PUBLIC_FEATURES.map((item) => (
              <div key={item} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <iconify-icon icon="solar:star-bold" width="14" className="mt-0.5 text-indigo-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-5">Quality and Trust</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {CONTRIBUTOR_AND_ADMIN.map((item) => (
              <div key={item} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <iconify-icon icon="solar:shield-check-bold" width="14" className="mt-0.5 text-indigo-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProjectCTA secondaryTo="/projects" secondaryLabel="Back to Projects" />
    </>
  );
}