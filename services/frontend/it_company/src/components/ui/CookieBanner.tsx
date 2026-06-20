import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/** Persist a unique-ish visitor ID so repeated visits stay linked. */
function getVisitorId(): string {
  const KEY = 'cloudie-visitor-id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/** Fire-and-forget write to Firestore `consents` collection.
 *  Uses the visitor ID as the document ID so re-submissions update
 *  the existing record instead of creating duplicates.
 */
async function recordConsent(choice: 'all' | 'necessary') {
  try {
    const visitorId = getVisitorId();
    await setDoc(doc(db, 'consents', visitorId), {
      visitorId,
      choice,
      userAgent: navigator.userAgent,
      language: navigator.language,
      url: window.location.href,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    // Non-critical — don't break the UI if Firestore is unreachable
    console.warn('[CookieBanner] Failed to record consent:', err);
  }
}

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !localStorage.getItem('cloudie-cookies'));

  const reopen = useCallback(() => {
    localStorage.removeItem('cloudie-cookies');
    setVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener('cloudie-reopen-cookies', reopen);
    return () => window.removeEventListener('cloudie-reopen-cookies', reopen);
  }, [reopen]);

  const accept = (choice: 'all' | 'necessary') => {
    localStorage.setItem('cloudie-cookies', choice);
    setVisible(false);
    recordConsent(choice);
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
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => accept('all')}
          className="flex-1 px-4 py-2 text-xs font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
        >
          {t('cookie.acceptAll')}
        </button>
        <button
          onClick={() => accept('necessary')}
          className="flex-1 px-4 py-2 text-xs font-medium rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        >
          {t('cookie.necessaryOnly')}
        </button>
      </div>
    </div>
  );
}
