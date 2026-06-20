import { useTranslation } from 'react-i18next';
import techStack from '../../data/techstack.json';

export default function TechStack() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/20 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-6 uppercase tracking-widest">
          {t('techStack.label')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-16">
          {techStack.map(({ name, icon }) => (
            <div
              key={name}
              className="flex items-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-default text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:scale-110 dark:hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            >
              <iconify-icon icon={icon} width="24" className="sm:[--icon-size:28px] transition-all duration-300" />
              <span className="text-base sm:text-xl font-semibold tracking-tighter">{name}</span>
            </div>
          ))}
          <span className="text-base sm:text-xl font-semibold tracking-tighter text-zinc-400 dark:text-zinc-500">
            {t('techStack.more')}
          </span>
        </div>
      </div>
    </section>
  );
}
