import type { ReactNode } from 'react';

/** The one card shape every block on the detail page sits in. */
export function Section({
  title,
  subtitle,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}>
      {title !== undefined && (
        <div className="mb-3 min-w-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle !== undefined && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
