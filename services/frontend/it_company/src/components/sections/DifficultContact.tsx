import { useState, useRef, useCallback, useEffect, type FormEvent } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getRateLimitSecondsRemaining, recordSubmission } from '../../lib/rateLimit';
import social from '../../data/social.json';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'confirming';

/** Shared input class used by every text field */
const INPUT_CLS =
  'w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400';

/* ── Budget examples for the slot machine ─────────────────── */
const BUDGET_OPTIONS = [
  '€500',
  '€2,000',
  '€5,000',
  '€10,000',
  '€25,000',
  '€50,000',
  '€75,000',
  '€100,000',
  '€150,000',
  '€250,000',
  '€500,000',
  '€1,000,000',
  '💸 Too much',
  '🤷 No idea',
  '🍕 A pizza',
];

/* ── Slot machine budget spinner (vertical 3D reel) ───────── */
function SlotMachineBudget({
  value,
  onValueChange,
  spinLabel,
  stopLabel,
}: {
  value: string;
  onValueChange: (v: string) => void;
  spinLabel: string;
  stopLabel: string;
}) {
  const [spinning, setSpinning] = useState(false);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    onValueChange('');
    let idx = Math.floor(Math.random() * BUDGET_OPTIONS.length);
    let deg = 0;
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % BUDGET_OPTIONS.length;
      deg += 360;
      setDisplayIdx(idx);
      setRotationDeg(deg);
    }, 150);
  };

  const stopSpin = () => {
    if (!spinning) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setSpinning(false);
    onValueChange(BUDGET_OPTIONS[displayIdx]);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-3">
        {/* Slot display with vertical 3D reel */}
        <div
          className="w-full max-w-xs overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
          style={{ perspective: '300px' }}
        >
          <div
            className="h-12 flex items-center justify-center text-lg font-mono font-bold text-zinc-900 dark:text-white select-none"
            style={{
              transform: spinning ? `rotateX(${rotationDeg}deg)` : 'rotateX(0deg)',
              transition: spinning ? 'transform 0.12s ease-in' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: 'center center',
            }}
          >
            {value || BUDGET_OPTIONS[displayIdx]}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={startSpin}
            disabled={spinning}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <iconify-icon icon="solar:refresh-circle-linear" width="14" />
            {spinLabel}
          </button>
          <button
            type="button"
            onClick={stopSpin}
            disabled={!spinning}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg border border-red-400 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <iconify-icon icon="solar:stop-circle-linear" width="14" />
            {stopLabel}
          </button>
        </div>

        {/* Locked result */}
        {value && !spinning && (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
            <iconify-icon icon="solar:check-circle-linear" width="16" />
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Runaway checkbox (bounded, no visible border) ────────── */
function RunawayCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [escapeCount, setEscapeCount] = useState(0);

  const handleMouseEnter = useCallback(() => {
    if (checked) return;
    setEscapeCount((c) => c + 1);

    const wrapper = wrapperRef.current;
    const lbl = labelRef.current;
    if (!wrapper || !lbl) return;

    const wRect = wrapper.getBoundingClientRect();
    const lRect = lbl.getBoundingClientRect();

    const maxX = wRect.width - lRect.width;
    const maxY = wRect.height - lRect.height;

    const rx = Math.random() * Math.max(maxX, 0);
    const ry = Math.random() * Math.max(maxY, 0);

    setOffset({ x: rx, y: ry });
  }, [checked]);

  const canCatch = escapeCount >= 10;

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden"
      style={{ minHeight: 80 }}
    >
      <label
        ref={labelRef}
        className="absolute flex items-start gap-2 cursor-pointer group w-max max-w-full p-2"
        style={{
          left: canCatch ? 0 : offset.x,
          top: canCatch ? 0 : offset.y,
          transition: canCatch
            ? 'left 0.1s, top 0.1s'
            : 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={handleMouseEnter}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="w-4 h-4 rounded-[4px] border border-transparent bg-transparent peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
            <iconify-icon
              icon="solar:check-read-linear"
              className={`text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
              width="10"
            />
          </div>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed select-none">
          {label}
        </span>
      </label>
    </div>
  );
}

/* ── Password asterisk input ──────────────────────────────── */
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        type="password"
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLS}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

/* ── Invisible text input (same color as bg, visible on selection) ─ */
function InvisibleTextInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        type="text"
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLS} !text-zinc-50 dark:!text-zinc-900 selection:bg-indigo-500 selection:text-white caret-indigo-500`}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ── Reversed-order email input (+ periodic corruption) ──── */
function ReversedOrderInput({
  id,
  value,
  onChange,
  placeholder,
  label,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Periodically swap two adjacent characters to corrupt the email
  const hasEnough = value.length >= 3;
  useEffect(() => {
    if (!hasEnough) return;
    const timer = setInterval(() => {
      const v = valueRef.current;
      if (v.length < 3) return;
      const idx = Math.floor(Math.random() * (v.length - 1));
      const arr = v.split('');
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      onChangeRef.current(arr.join(''));
    }, 3000);
    return () => clearInterval(timer);
  }, [hasEnough]);

  const displayValue = value.split('').reverse().join('');

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_CLS} opacity-0 absolute inset-0`}
          placeholder={placeholder}
        />
        <div
          className={`${INPUT_CLS} min-h-[44px] pointer-events-none`}
          style={{ direction: 'rtl', unicodeBidi: 'bidi-override' }}
        >
          {displayValue || <span className="text-zinc-400">{placeholder.split('').reverse().join('')}</span>}
        </div>
        <div
          className="absolute inset-0 cursor-text"
          onClick={() => document.getElementById(id)?.focus()}
        />
      </div>
    </div>
  );
}

/* ── Glow-and-delete textarea ─────────────────────────────── */
function GlowDeleteTextarea({
  id,
  value,
  onChange,
  placeholder,
  label,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}) {
  const [glowIndices, setGlowIndices] = useState<Set<number>>(new Set());
  const glowRef = useRef(glowIndices);
  glowRef.current = glowIndices;
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (value.length === 0) return;

    // Start quickly (1s initial delay), then every 4s
    const timeout = setTimeout(() => {
      fire();
      intervalRef.current = setInterval(fire, 4000);
    }, 1000);

    function fire() {
      const txt = valueRef.current;
      if (txt.length === 0) return;

      const available = Array.from({ length: txt.length }, (_, i) => i).filter(
        (i) => !glowRef.current.has(i)
      );
      if (available.length === 0) return;

      const idx = available[Math.floor(Math.random() * available.length)];
      setGlowIndices((prev) => new Set(prev).add(idx));

      setTimeout(() => {
        const current = valueRef.current;
        if (idx < current.length) {
          const newVal = current.slice(0, idx) + current.slice(idx + 1);
          onChangeRef.current(newVal);
        }
        setGlowIndices((prev) => {
          const next = new Set(prev);
          next.delete(idx);
          const shifted = new Set<number>();
          next.forEach((i) => shifted.add(i > idx ? i - 1 : i));
          return shifted;
        });
      }, 1200);
    }

    const intervalRef = { current: null as ReturnType<typeof setInterval> | null };

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value.length]);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <textarea
          id={id}
          rows={4}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-400 resize-none opacity-0 absolute inset-0 h-full"
          placeholder={placeholder}
        />
        <div
          className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white min-h-[120px] pointer-events-none whitespace-pre-wrap break-words"
        >
          {value.length === 0 ? (
            <span className="text-zinc-400">{placeholder}</span>
          ) : (
            value.split('').map((ch, i) => (
              <span
                key={`${i}-${ch}`}
                style={
                  glowIndices.has(i)
                    ? {
                        color: '#ef4444',
                        textShadow: '0 0 8px #ef4444, 0 0 16px #ef4444',
                        transition: 'color 0.3s, text-shadow 0.3s',
                      }
                    : { transition: 'color 0.3s, text-shadow 0.3s' }
                }
              >
                {ch}
              </span>
            ))
          )}
        </div>
        <div
          className="absolute inset-0 cursor-text"
          onClick={() => document.getElementById(id)?.focus()}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DifficultContact — the "hard mode" form
   ══════════════════════════════════════════════════════════════ */
export default function DifficultContact({
  onToggleBack,
}: {
  onToggleBack: () => void;
}) {
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Budget: slot machine
  const [budgetValue, setBudgetValue] = useState('');

  // Real values for submission
  const realName = fullName;
  const realCompany = company;
  const realEmail = workEmail; // stored as-is, display is reversed but input value is correct
  const realDetails = projectDetails;

  const isValid =
    realName.trim() !== '' &&
    realEmail.trim() !== '' &&
    realDetails.trim() !== '' &&
    privacyConsent;

  // Clean up countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(15);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || status === 'submitting') return;

    // Client-side rate limit (shares cooldown with normal contact form)
    const remaining = getRateLimitSecondsRemaining('contact');
    if (remaining > 0) {
      setStatus('error');
      return;
    }

    // First press starts 15s countdown; second press after countdown ends submits
    if (countdown === 0 && status !== 'confirming') {
      setStatus('confirming');
      startCountdown();
      return;
    }
    if (countdown > 0) return; // waiting for countdown

    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contacts'), {
        fullName: realName.trim(),
        company: realCompany.trim(),
        workEmail: realEmail.trim(),
        projectBudget: budgetValue || null,
        projectDetails: realDetails.trim(),
        privacyConsent,
        difficultMode: true,
        funnyMode: true,
        language: navigator.language,
        url: window.location.href,
        createdAt: serverTimestamp(),
      });
      recordSubmission('contact');
      setStatus('success');
    } catch (err) {
      console.error('[DifficultContact] Failed to submit:', err);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium tracking-tight">
          <iconify-icon icon="solar:danger-triangle-linear" width="14" />
          {t('contact.difficult.badge')}
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
          {t('contact.difficult.title')}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          {t('contact.difficult.subtitle')}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Status banners */}
        {status === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            <iconify-icon icon="solar:check-circle-linear" width="20" className="flex-shrink-0" />
            {t('contact.difficult.successMessage')}
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <iconify-icon icon="solar:danger-triangle-linear" width="20" className="flex-shrink-0" />
            {t('contact.form.errorMessage')}
          </div>
        )}

        {/* Name (password asterisks) + Company (invisible text) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PasswordInput
            id="difficult-name"
            value={fullName}
            onChange={(v) => { setFullName(v); if (status === 'error') setStatus('idle'); }}
            placeholder={t('contact.form.placeholder.name')}
            label={t('contact.form.fullName')}
            required
          />
          <InvisibleTextInput
            id="difficult-company"
            value={company}
            onChange={(v) => { setCompany(v); if (status === 'error') setStatus('idle'); }}
            placeholder={t('contact.form.placeholder.company')}
            label={t('contact.form.company')}
          />
        </div>

        {/* Email (reversed letter order) */}
        <ReversedOrderInput
          id="difficult-email"
          value={workEmail}
          onChange={(v) => { setWorkEmail(v); if (status === 'error') setStatus('idle'); }}
          placeholder={t('contact.form.placeholder.email')}
          label={t('contact.form.workEmail')}
          required
        />

        {/* Budget: slot machine spinner */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {t('contact.form.projectBudget')}
          </label>
          <SlotMachineBudget
            value={budgetValue}
            onValueChange={setBudgetValue}
            spinLabel={t('contact.difficult.spin')}
            stopLabel={t('contact.difficult.stop')}
          />
        </div>

        {/* Project details (glow red & delete letters) */}
        <GlowDeleteTextarea
          id="difficult-message"
          value={projectDetails}
          onChange={(v) => { setProjectDetails(v); if (status === 'error') setStatus('idle'); }}
          placeholder={t('contact.form.placeholder.message')}
          label={t('contact.form.projectDetails')}
          required
        />

        {/* Runaway checkbox */}
        <RunawayCheckbox
          checked={privacyConsent}
          onChange={setPrivacyConsent}
          label={
            <Trans
              i18nKey="contact.form.privacyConsent"
              components={{
                privacy: (
                  <a href="/legal/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline" />
                ),
              }}
            />
          }
        />

        {/* Submit with 15s countdown delay */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isValid || status === 'submitting' || countdown > 0}
            className="inline-flex items-center justify-center gap-2 px-10 py-3.5 text-sm font-medium rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'submitting' ? (
              <>
                <iconify-icon icon="solar:refresh-linear" width="16" className="animate-spin" />
                {t('contact.form.submitting')}
              </>
            ) : countdown > 0 ? (
              <>
                <iconify-icon icon="solar:clock-circle-linear" width="16" className="animate-spin" />
                {t('contact.difficult.confirmCountdown', { seconds: countdown })}
              </>
            ) : status === 'confirming' ? (
              <>
                {t('contact.difficult.confirmNow')}
                <iconify-icon icon="solar:arrow-right-linear" width="16" />
              </>
            ) : (
              <>
                {t('contact.difficult.submit')}
                <iconify-icon icon="solar:arrow-right-linear" width="16" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* WhatsApp divider */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">{t('contact.orWhatsApp')}</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="flex justify-center">
        <a
          href={`${social.whatsapp.url}?text=${encodeURIComponent(t('whatsapp.defaultMessage'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-2.5 px-10 py-3 text-sm font-medium rounded-xl text-white bg-[#25D366] hover:bg-[#20BD5A] transition-all hover:scale-[1.01] shadow-sm"
        >
          <iconify-icon icon="mdi:whatsapp" width="20" />
          {t('contact.whatsAppCta')}
        </a>
      </div>

      {/* Switch back */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onToggleBack}
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {t('contact.difficult.switchBack')}
        </button>
      </div>
    </div>
  );
}
