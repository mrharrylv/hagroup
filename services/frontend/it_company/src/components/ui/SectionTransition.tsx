import ScrollReveal from './ScrollReveal';

export default function SectionTransition() {
  return (
    <ScrollReveal variant="scale" className="pointer-events-none" delay={80}>
      <div className="relative h-24 sm:h-28 max-w-5xl mx-auto px-6" aria-hidden="true">
        <div className="absolute left-6 right-6 top-1/2 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 shadow-[0_0_28px_rgba(99,102,241,0.16)] flex items-center justify-center">
          <div className="flex flex-col items-center -space-y-1 text-indigo-500 dark:text-indigo-400">
            <iconify-icon icon="solar:alt-arrow-down-linear" width="14" />
            <iconify-icon icon="solar:alt-arrow-down-linear" width="14" className="opacity-45" />
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
