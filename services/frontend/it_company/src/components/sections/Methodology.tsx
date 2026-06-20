import { useTranslation } from 'react-i18next';
import { useMethodologyData } from '../../lib/content';

export default function Methodology() {
  const { t } = useTranslation();
  const methodologyData = useMethodologyData();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="p-6 sm:p-10 md:p-16 rounded-2xl sm:rounded-[2.5rem] bg-zinc-900 text-white relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 relative z-10">
          {t('methodology.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
          {methodologyData.map((step, i) => (
            <div
              key={step.key}
              className="relative group rounded-2xl p-4 -m-4 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] hover:scale-[1.04] cursor-default"
            >
              <div className="text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3 transition-colors duration-300 group-hover:text-indigo-300">
                {step.phase}
              </div>
              <h4 className="text-lg font-medium tracking-tight mb-2 transition-colors duration-300 group-hover:text-white">
                {step.title}
              </h4>
              <p className="text-sm text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
                {step.description}
              </p>
              {/* Connector line */}
              {i < methodologyData.length - 1 && (
                <div className="hidden md:block absolute top-2 left-full w-full h-[1px] bg-gradient-to-r from-zinc-700 to-transparent -ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
