import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getRateLimitSecondsRemaining, recordSubmission } from '../../lib/rateLimit';
import { useCareersData } from '../../lib/content';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface CareerForm {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  position: string;
  coverLetter: string;
  privacyConsent: boolean;
}

const INITIAL_FORM: CareerForm = {
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  position: '',
  coverLetter: '',
  privacyConsent: false,
};

export default function CareerContact() {
  const { t } = useTranslation();
  const careersData = useCareersData();
  const [form, setForm] = useState<CareerForm>(INITIAL_FORM);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [cooldown, setCooldown] = useState(() => getRateLimitSecondsRemaining('career'));

  // Tick down the cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      const remaining = getRateLimitSecondsRemaining('career');
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isValid =
    form.fullName.trim() !== '' &&
    form.email.trim() !== '' &&
    form.privacyConsent;

  const handleChange = (field: keyof CareerForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || status === 'submitting') return;

    // Client-side rate limit
    const remaining = getRateLimitSecondsRemaining('career');
    if (remaining > 0) {
      setCooldown(remaining);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      // Save application to Firestore
      await addDoc(collection(db, 'career_applications'), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        linkedin: form.linkedin.trim() || null,
        position: form.position || null,
        coverLetter: form.coverLetter.trim() || null,
        privacyConsent: form.privacyConsent,
        language: navigator.language,
        url: window.location.href,
        createdAt: serverTimestamp(),
      });

      recordSubmission('career');
      setCooldown(60);
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error('[CareerContact] Failed to submit application:', err);
      setStatus('error');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="bg-white dark:bg-zinc-900/30 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            {careersData.form.title}
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            {careersData.form.subtitle}
          </p>
        </div>

        {/* Form */}
        <form className="max-w-2xl mx-auto space-y-5" onSubmit={handleSubmit}>
          {/* Success banner */}
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
              <iconify-icon icon="solar:check-circle-linear" width="20" className="flex-shrink-0" />
              {t('careers.form.successMessage')}
            </div>
          )}

          {/* Error banner */}
          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <iconify-icon icon="solar:danger-triangle-linear" width="20" className="flex-shrink-0" />
              {t('careers.form.errorMessage')}
            </div>
          )}

          {/* Rate limit banner */}
          {cooldown > 0 && status !== 'error' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
              <iconify-icon icon="solar:clock-circle-linear" width="20" className="flex-shrink-0" />
              {t('careers.form.rateLimitMessage', { seconds: cooldown })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="career-name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('careers.form.fields.fullName')}
              </label>
              <input
                type="text"
                id="career-name"
                required
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder={t('careers.form.placeholder.name')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="career-email" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('careers.form.fields.email')}
              </label>
              <input
                type="email"
                id="career-email"
                required
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder={t('careers.form.placeholder.email')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="career-phone" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('careers.form.fields.phone')}
              </label>
              <input
                type="tel"
                id="career-phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder={t('careers.form.placeholder.phone')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="career-linkedin" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('careers.form.fields.linkedin')}
              </label>
              <input
                type="url"
                id="career-linkedin"
                value={form.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder={t('careers.form.placeholder.linkedin')}
              />
            </div>
          </div>

          {/* Position Select */}
          <div className="space-y-2 relative">
            <label htmlFor="career-position" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t('careers.form.fields.position')}
            </label>
            <div className="relative">
              <select
                id="career-position"
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all cursor-pointer"
              >
                <option value="" disabled className="text-zinc-400">
                  {t('careers.form.fields.selectPosition')}
                </option>
                {careersData.positions.map((pos) => (
                  <option key={pos.value} value={pos.value}>{pos.title}</option>
                ))}
                <option value="other">{t('careers.form.fields.otherPosition')}</option>
              </select>
              <iconify-icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                width="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="career-message" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t('careers.form.fields.coverLetter')}
            </label>
            <textarea
              id="career-message"
              rows={4}
              value={form.coverLetter}
              onChange={(e) => handleChange('coverLetter', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400 resize-none"
              placeholder={t('careers.form.placeholder.coverLetter')}
            />
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-2 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={form.privacyConsent}
                onChange={(e) => handleChange('privacyConsent', e.target.checked)}
              />
              <div className="w-4 h-4 rounded-[4px] border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
                <iconify-icon
                  icon="solar:check-read-linear"
                  className={`text-white transition-opacity ${form.privacyConsent ? 'opacity-100' : 'opacity-0'}`}
                  width="10"
                />
              </div>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed select-none">
              <Trans
                i18nKey="careers.form.fields.privacyConsent"
                components={{
                  privacy: (
                    <a href="/legal/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline" />
                  ),
                }}
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={!isValid || status === 'submitting'}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all hover:scale-[1.01] shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'submitting' ? (
              <>
                <iconify-icon icon="solar:refresh-linear" width="16" className="animate-spin" />
                {t('careers.form.submitting')}
              </>
            ) : (
              <>
                {t('careers.form.fields.submit')}
                <iconify-icon icon="solar:arrow-right-linear" width="16" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
