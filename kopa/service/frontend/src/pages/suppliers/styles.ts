/**
 * Shared Tailwind class strings for the supplier page.
 *
 * They live in a plain module so the section components stay component-only and
 * the panels, buttons and inputs spread across them cannot drift apart visually.
 */

export const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none';

export const PANEL_CLASS = 'rounded-xl border border-slate-200 bg-white';

const BTN_BASE = 'rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:outline-none';

export const BTN_PRIMARY = `${BTN_BASE} bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-300`;

export const BTN_OUTLINE = `${BTN_BASE} border border-brand-600 text-brand-700 hover:bg-brand-50 focus:ring-brand-300`;

export const BTN_SUBTLE = `${BTN_BASE} border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-300`;

export const NOTICE_CLASS =
  'rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200 ring-inset';

/** Every section below the hero sits the same distance from the one above it. */
export const SECTION_CLASS = 'mt-10';

/** The "nothing here yet" paragraph, shared by the board and the bid list. */
export const EMPTY_CLASS =
  'mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500';

/** A section heading with its aside pushed to the far end of the same line. */
export const SECTION_HEAD_CLASS = 'flex flex-wrap items-baseline justify-between gap-2';

export const HEADING_CLASS = 'text-lg font-semibold text-slate-900';

export const SECTION_NOTE_CLASS = 'text-xs text-slate-500';
