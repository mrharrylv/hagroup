import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import social from '../../data/social.json';

export default function WhatsAppButton() {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const defaultMessage = encodeURIComponent(t('whatsapp.defaultMessage'));
  const whatsappUrl = social.whatsapp.url;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <div
        className={`bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 transition-all duration-300 whitespace-nowrap ${
          isHovered
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        {t('whatsapp.tooltip')}
      </div>

      {/* Button */}
      <a
        href={`${whatsappUrl}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsapp.ariaLabel')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <iconify-icon
          icon="mdi:whatsapp"
          width="28"
          className="text-white"
        />
        {/* Pulse ring */}
        <span className="absolute w-14 h-14 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />
      </a>
    </div>
  );
}
