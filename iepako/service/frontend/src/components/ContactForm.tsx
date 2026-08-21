import { useState, type FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { localized, products } from '../lib/content';

const LAST_SUBMIT_KEY = 'iepako-contact-last-submit';
const MIN_SUBMIT_INTERVAL_MS = 30_000;

interface ContactFormProps {
  selectedProduct: string;
  onProductChange: (productId: string) => void;
}

interface FormValues {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  quantity: string;
  message: string;
  privacyConsent: boolean;
}

const initialValues: FormValues = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  quantity: '',
  message: '',
  privacyConsent: false,
};

export default function ContactForm({ selectedProduct, onProductChange }: ContactFormProps) {
  const { t, i18n } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'configuration'>('idle');

  const language = i18n.resolvedLanguage || i18n.language || 'lv';
  const isValid =
    values.fullName.trim().length > 1 &&
    values.email.trim().length > 3 &&
    selectedProduct.length > 0 &&
    values.message.trim().length > 4 &&
    values.privacyConsent;

  const update = (field: keyof FormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (status !== 'submitting') setStatus('idle');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || status === 'submitting') return;

    if (!isFirebaseConfigured || !db) {
      setStatus('configuration');
      return;
    }

    try {
      const previousSubmit = Number(localStorage.getItem(LAST_SUBMIT_KEY) || '0');
      if (Date.now() - previousSubmit < MIN_SUBMIT_INTERVAL_MS) {
        setStatus('success');
        return;
      }
    } catch {
      // Firestore rules remain the authoritative validation layer.
    }

    setStatus('submitting');
    try {
      await addDoc(collection(db, 'iepako_contacts'), {
        fullName: values.fullName.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        productId: selectedProduct,
        quantity: values.quantity.trim(),
        message: values.message.trim(),
        privacyConsent: true,
        language,
        url: window.location.href,
        source: 'iepako.hagroup.lv',
        createdAt: serverTimestamp(),
      });

      try {
        localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
      } catch {
        // Submission succeeded even when local storage is unavailable.
      }

      setValues(initialValues);
      onProductChange('');
      setStatus('success');
    } catch (error) {
      console.error('[IEPAKO contact] Could not submit enquiry:', error);
      setStatus('error');
    }
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      {status === 'success' && <div className="form-notice success">{t('contact.form.success')}</div>}
      {status === 'error' && <div className="form-notice error">{t('contact.form.error')}</div>}
      {status === 'configuration' && <div className="form-notice error">{t('contact.form.configurationError')}</div>}

      <div className="form-grid">
        <label>
          <span>{t('contact.form.fullName')} *</span>
          <input
            required
            autoComplete="name"
            value={values.fullName}
            maxLength={200}
            onChange={(event) => update('fullName', event.target.value)}
          />
        </label>
        <label>
          <span>{t('contact.form.company')}</span>
          <input
            autoComplete="organization"
            value={values.company}
            maxLength={200}
            onChange={(event) => update('company', event.target.value)}
          />
        </label>
        <label>
          <span>{t('contact.form.email')} *</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={values.email}
            maxLength={200}
            onChange={(event) => update('email', event.target.value)}
          />
        </label>
        <label>
          <span>{t('contact.form.phone')}</span>
          <input
            type="tel"
            autoComplete="tel"
            value={values.phone}
            maxLength={50}
            onChange={(event) => update('phone', event.target.value)}
          />
        </label>
        <label>
          <span>{t('contact.form.product')} *</span>
          <select required value={selectedProduct} onChange={(event) => onProductChange(event.target.value)}>
            <option value="">{t('contact.form.productPlaceholder')}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{localized(product.name, language)}</option>
            ))}
            <option value="other">{t('contact.form.otherProduct')}</option>
          </select>
        </label>
        <label>
          <span>{t('contact.form.quantity')}</span>
          <input
            value={values.quantity}
            maxLength={200}
            placeholder={t('contact.form.quantityPlaceholder')}
            onChange={(event) => update('quantity', event.target.value)}
          />
        </label>
      </div>

      <label>
        <span>{t('contact.form.message')} *</span>
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={values.message}
          placeholder={t('contact.form.messagePlaceholder')}
          onChange={(event) => update('message', event.target.value)}
        />
      </label>

      <label className="privacy-check">
        <input
          type="checkbox"
          required
          checked={values.privacyConsent}
          onChange={(event) => update('privacyConsent', event.target.checked)}
        />
        <span>
          <Trans i18nKey="contact.form.privacy" components={{ privacy: <a href="/privacy" /> }} />
        </span>
      </label>

      <button className="button button-accent submit-button" type="submit" disabled={!isValid || status === 'submitting'}>
        {status === 'submitting' ? t('contact.form.submitting') : t('contact.form.submit')}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
