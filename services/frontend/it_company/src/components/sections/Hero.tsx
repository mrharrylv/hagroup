import { useTranslation } from 'react-i18next';
import Antigravity from '../ui/Antigravity';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-24 flex flex-col items-center text-center overflow-hidden">
      <Antigravity />

      <h1
        className="relative text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight max-w-4xl leading-tight animate-blur-in"
        style={{ animationDelay: '0.15s' }}
      >
        <span className="text-zinc-900 dark:text-white">{t('hero.titleLine1')}</span>{' '}
        <br className="hidden md:block" />
        <span className="gradient-text">{t('hero.titleLine2')}</span>
      </h1>

      <p
        className="relative mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed animate-blur-in"
        style={{ animationDelay: '0.3s' }}
      >
        {t('hero.description')}
      </p>
    </section>
  );
}
