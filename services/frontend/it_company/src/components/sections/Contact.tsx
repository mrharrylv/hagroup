import { useState, type FormEvent } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useBudgetsData } from '../../lib/content';

import social from '../../data/social.json';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface ContactForm {
  fullName: string;
  company: string;
  workEmail: string;
  projectBudget: string;
  projectDetails: string;
  privacyConsent: boolean;
}

const INITIAL_FORM: ContactForm = {
  fullName: '',
  company: '',
  workEmail: '',
  projectBudget: '',
  projectDetails: '',
  privacyConsent: false,
};

export default function Contact() {
  const { t } = useTranslation();
  const budgets = useBudgetsData();
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [status, setStatus] = useState<FormStatus>('idle');

  const isValid =
    form.fullName.trim() !== '' &&
    form.workEmail.trim() !== '' &&
    form.projectDetails.trim() !== '' &&
    form.privacyConsent;

  const handleChange = (field: keyof ContactForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || status === 'submitting') return;

    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contacts'), {
        fullName: form.fullName.trim(),
        company: form.company.trim(),
        workEmail: form.workEmail.trim(),
        projectBudget: form.projectBudget || null,
        projectDetails: form.projectDetails.trim(),
        privacyConsent: form.privacyConsent,
        language: navigator.language,
        url: window.location.href,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error('[Contact] Failed to submit form:', err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div
          className="bg-white dark:bg-zinc-900/30 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Success banner */}
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
              <iconify-icon icon="solar:check-circle-linear" width="20" className="flex-shrink-0" />
              {t('contact.form.successMessage')}
            </div>
          )}

          {/* Error banner */}
          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <iconify-icon icon="solar:danger-triangle-linear" width="20" className="flex-shrink-0" />
              {t('contact.form.errorMessage')}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('contact.form.fullName')}
              </label>
              <input
                type="text"
                id="name"
                required
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder={t('contact.form.placeholder.name')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('contact.form.company')}
              </label>
              <input
                type="text"
                id="company"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
                placeholder={t('contact.form.placeholder.company')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t('contact.form.workEmail')}
            </label>
            <input
              type="email"
              id="email"
              required
              value={form.workEmail}
              onChange={(e) => handleChange('workEmail', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400"
              placeholder={t('contact.form.placeholder.email')}
            />
          </div>

          {/* Budget Select */}
          <div className="space-y-2 relative">
            <label htmlFor="budget" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t('contact.form.projectBudget')}
            </label>
            <div className="relative">
              <select
                id="budget"
                value={form.projectBudget}
                onChange={(e) => handleChange('projectBudget', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all cursor-pointer"
              >
                <option value="" disabled className="text-zinc-400">
                  {t('contact.form.selectRange')}
                </option>
                {budgets.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <iconify-icon
                icon="solar:alt-arrow-down-linear"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                width="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t('contact.form.projectDetails')}
            </label>
            <textarea
              id="message"
              rows={4}
              required
              value={form.projectDetails}
              onChange={(e) => handleChange('projectDetails', e.target.value)}
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-zinc-400 resize-none"
              placeholder={t('contact.form.placeholder.message')}
            />
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-px">
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
                  width="12"
                />
              </div>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight select-none">
              <Trans
                i18nKey="contact.form.privacyConsent"
                components={{
                  privacy: (
                    <a href="/legal/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline" />
                  ),
                }}
              />
            </span>
          </label>

          <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isValid || status === 'submitting'}
            className="inline-flex items-center justify-center gap-2 px-10 py-3.5 text-sm font-medium rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'submitting' ? (
              <>
                <iconify-icon icon="solar:refresh-linear" width="16" className="animate-spin" />
                {t('contact.form.submitting')}
              </>
            ) : (
              <>
                {t('contact.form.submit')}
                <iconify-icon icon="solar:arrow-right-linear" width="16" />
              </>
            )}
          </button>
          </div>
        </form>

        {/* WhatsApp divider */}
        <div className="flex items-center gap-4 mt-8">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">{t('contact.orWhatsApp')}</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="flex justify-center">
        <a
          href={`${social.whatsapp.url}?text=${encodeURIComponent(t('whatsapp.defaultMessage'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2.5 px-10 py-3.5 text-sm font-medium rounded-xl text-white bg-[#25D366] hover:bg-[#20BD5A] transition-all hover:scale-[1.01] shadow-sm"
        >
          <iconify-icon icon="mdi:whatsapp" width="20" />
          {t('contact.whatsAppCta')}
        </a>
        </div>

        </div>
    </section>
  );
}
