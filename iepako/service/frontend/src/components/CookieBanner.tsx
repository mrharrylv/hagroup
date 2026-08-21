import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'iepako-cookie-notice';
const NOTICE_VERSION = '2026-08-21';
const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

interface StoredNotice {
  version: string;
  expiresAt: string;
  recordId: string;
}

function hasCurrentNotice(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return false;
    const stored = JSON.parse(value) as StoredNotice;
    return (
      stored.version === NOTICE_VERSION &&
      Boolean(stored.recordId) &&
      new Date(stored.expiresAt).getTime() > Date.now()
    );
  } catch {
    return false;
  }
}

export default function CookieBanner() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(() => !hasCurrentNotice());
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const reopen = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The notice can still be reopened for the current page view.
    }
    setStatus('idle');
    setVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener('iepako-reopen-cookies', reopen);
    return () => window.removeEventListener('iepako-reopen-cookies', reopen);
  }, [reopen]);

  const acknowledge = async () => {
    if (status === 'saving') return;
    setStatus('saving');

    const expiresAt = new Date(Date.now() + RETENTION_MS);

    try {
      let recordId = 'local-preview';
      if (db) {
        const record = await addDoc(collection(db, 'iepako_consents'), {
          recordType: 'necessary_storage_notice',
          choice: 'necessary',
          noticeVersion: NOTICE_VERSION,
          language: i18n.resolvedLanguage || i18n.language || 'lv',
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAt),
        });
        recordId = record.id;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: NOTICE_VERSION,
          expiresAt: expiresAt.toISOString(),
          recordId,
        } satisfies StoredNotice),
      );
      setVisible(false);
      setStatus('idle');
    } catch (error) {
      console.error('[IEPAKO cookies] Could not store acknowledgement:', error);
      setStatus('error');
    }
  };

  if (!visible) return null;

  return (
    <aside className="cookie-banner" aria-live="polite">
      <div className="cookie-icon" aria-hidden="true">◎</div>
      <div>
        <h2>{t('cookieBanner.title')}</h2>
        <p>
          <Trans
            i18nKey="cookieBanner.description"
            components={{ cookies: <a href="/cookies" /> }}
          />
        </p>
        {status === 'error' && <p className="form-error">{t('cookieBanner.error')}</p>}
      </div>
      <button className="button button-dark cookie-button" onClick={acknowledge} disabled={status === 'saving'}>
        {status === 'saving' ? t('cookieBanner.saving') : t('cookieBanner.acknowledge')}
      </button>
    </aside>
  );
}
