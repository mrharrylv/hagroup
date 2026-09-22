export type ProgressTone = 'brand' | 'amber' | 'emerald' | 'slate';

const TRACK: Record<ProgressTone, string> = {
  brand: 'bg-brand-600',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-600',
  slate: 'bg-slate-400',
};

export function Progress({
  value,
  tone = 'brand',
  label,
  className = '',
}: {
  /** 0–1. Values above 1 are clamped for the bar but not for the caption. */
  value: number;
  tone?: ProgressTone;
  label?: string;
  className?: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div className={className}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Campaign progress'}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${TRACK[tone]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
