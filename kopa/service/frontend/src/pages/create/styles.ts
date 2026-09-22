/**
 * Shared Tailwind class strings for the create form.
 *
 * They live in a plain module so the component files stay component-only and
 * the form's controls cannot drift apart visually.
 */

export const INPUT =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 ' +
  'focus:outline-none disabled:bg-slate-50';

export const INPUT_INVALID = 'border-rose-400 focus:border-rose-500 focus:ring-rose-200';

export const SELECT = `${INPUT} pr-8`;

export const TEXTAREA = `${INPUT} min-h-24 resize-y`;

export const CHIP =
  'rounded-lg border px-3 py-1.5 text-sm font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';

export const CHIP_ON = 'border-brand-600 bg-brand-600 text-white';

export const CHIP_OFF =
  'border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-800';

export const SECTION = 'rounded-xl border border-slate-200 bg-white p-4 sm:p-6';

export const LEGEND =
  'px-2 text-xs font-semibold tracking-wide text-slate-500 uppercase';

export const LABEL = 'block text-sm font-medium text-slate-700';

export const HINT = 'mt-0.5 text-xs text-slate-500';

export const ERROR = 'mt-1 text-xs font-medium text-rose-600';

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 ' +
  'text-sm font-semibold text-white transition hover:bg-brand-700 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600';

export const GHOST_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white ' +
  'px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-400 ' +
  'hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand-600';
