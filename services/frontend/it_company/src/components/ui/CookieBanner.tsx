import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const NOTICE_KEY = 'cloudie-cookies';
const LEGACY_VISITOR_KEY = 'cloudie-visitor-id';
const NOTICE_VERSION = '2026-07-15';
const NOTICE_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

type RecordStatus = 'idle' | 'saving' | 'error';

interface StoredAcknowledgement {
  choice: 'necessary';
  noticeVersion: string;
  recordId: string;
  acknowledgedAt: string;
  expiresAt: string;
}

function hasAcknowledgedNotice(): boolean {
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    if (!raw) return false;

    const stored = JSON.parse(raw) as StoredAcknowledgement;
    const isCurrent =
      stored.choice === 'necessary' &&
      stored.noticeVersion === NOTICE_VERSION &&
      typeof stored.recordId === 'string' &&
      stored.recordId.length > 0 &&
      new Date(stored.expiresAt).getTime() > Date.now();

    if (!isCurrent) localStorage.removeItem(NOTICE_KEY);
    return isCurrent;
  } catch {
    try {
      localStorage.removeItem(NOTICE_KEY);
    } catch {
      // Ignore unavailable browser storage.
    }
    return false;
  }
}

export default function CookieBanner() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(() => !hasAcknowledgedNotice());
  const [recordStatus, setRecordStatus] = useState<RecordStatus>('idle');

  const reopen = useCallback(() => {
    try {
      localStorage.removeItem(NOTICE_KEY);
    } catch {
      // The notice can still be shown for the current page view.
    }
    setRecordStatus('idle');
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

  const acknowledge = async () => {
    if (recordStatus === 'saving') return;

    setRecordStatus('saving');
    const acknowledgedAt = new Date();
    const expiresAt = new Date(acknowledgedAt.getTime() + NOTICE_RETENTION_MS);

    try {
      const record = await addDoc(collection(db, 'consents'), {
        recordType: 'necessary_storage_notice',
        choice: 'necessary',
        noticeVersion: NOTICE_VERSION,
        language: i18n.resolvedLanguage || i18n.language || 'en',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      try {
        const stored: StoredAcknowledgement = {
          choice: 'necessary',
          noticeVersion: NOTICE_VERSION,
          recordId: record.id,
          acknowledgedAt: acknowledgedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };
        localStorage.setItem(NOTICE_KEY, JSON.stringify(stored));
      } catch {
        // The server record exists; the notice may reappear if browser storage is blocked.
      }

      setRecordStatus('idle');
      setVisible(false);
    } catch (error) {
      console.error('[CookieBanner] Failed to record storage notice acknowledgement:', error);
      setRecordStatus('error');
    }
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
          disabled={recordStatus === 'saving'}
          className="w-full px-4 py-2 text-xs font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
        >
          {recordStatus === 'saving' ? t('cookie.recording') : t('cookie.acknowledge')}
        </button>
      </div>
      {recordStatus === 'error' && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {t('cookie.recordError')}
        </p>
      )}
    </div>
  );
}
