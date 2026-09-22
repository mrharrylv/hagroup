import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** One homepage band: a heading row, an optional action link, and the content. */
export function Section({
  title,
  lead,
  action,
  children,
  className = '',
}: {
  title?: string;
  lead?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-12 ${className}`}>
      {(title !== undefined || lead !== undefined || action !== undefined) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title !== undefined && (
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h2>
            )}
            {lead !== undefined && <p className="mt-1 text-sm text-slate-600">{lead}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const FOCUS = 'focus-visible:outline-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2';

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`bg-brand-700 hover:bg-brand-800 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${FOCUS}`}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`border-brand-300 text-brand-800 hover:border-brand-500 hover:bg-brand-50 inline-flex items-center justify-center rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold transition ${FOCUS}`}
    >
      {children}
    </Link>
  );
}

/** The "see everything" link that sits at the right-hand end of a heading row. */
export function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`text-brand-700 hover:text-brand-900 rounded text-sm font-medium hover:underline ${FOCUS}`}
    >
      {children}
      <span aria-hidden="true"> →</span>
    </Link>
  );
}
