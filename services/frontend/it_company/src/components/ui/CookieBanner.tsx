import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';

const NOTICE_KEY = 'cloudie-cookies';
const LEGACY_VISITOR_KEY = 'cloudie-visitor-id';

function hasAcknowledgedNotice(): boolean {
  try {
    return Boolean(localStorage.getItem(NOTICE_KEY));
  } catch {
    return false;
  }
}

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !hasAcknowledgedNotice());

  const reopen = useCallback(() => {
    try {
      localStorage.removeItem(NOTICE_KEY);
    } catch {
      // The notice can still be shown for the current page view.
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    // Remove the identifier created by the previous consent implementation.
    // Necessary storage does not require a persistent visitor identifier.
    try {
      localStorage.removeItem(LEGACY_VISITOR_KEY);
    } catch {
      // Ignore unavailable browser storage.
    }

    window.addEventListener('cloudie-reopen-cookies', reopen);
    return () => window.removeEventListener('cloudie-reopen-cookies', reopen);
  }, [reopen]);

  const acknowledge = () => {
    try {
      localStorage.setItem(NOTICE_KEY, 'acknowledged');
    } catch {
      // Keep dismissal limited to the current page view if storage is blocked.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col gap-3 sm:gap-4 transition-opacity duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
            {t('cookie.title')}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <Trans
              i18nKey="cookie.description"
              components={{
                cookie: (
                  <a href="/legal/cookies" className="text-indigo-600 dark:text-indigo-400 hover:underline" />
                ),
              }}
            />
          </p>
        </div>
        <iconify-icon icon="solar:cookie-linear" width="24" className="text-indigo-500 flex-shrink-0 mt-1" />
      </div>
      <div className="flex items-center mt-2">
        <button
          onClick={acknowledge}
          className="w-full px-4 py-2 text-xs font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
        >
          {t('cookie.acknowledge')}
        </button>
      </div>
    </div>
  );
}
