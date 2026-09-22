import { useState, type ReactNode } from 'react';
import { numberToInput, toNumber } from './model';
import {
  CHIP,
  CHIP_OFF,
  CHIP_ON,
  ERROR,
  HINT,
  INPUT,
  INPUT_INVALID,
  LABEL,
  LEGEND,
  SECTION,
} from './styles';

/** One numbered, bordered step of the form. */
export function FormSection({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={SECTION}>
      <legend className={LEGEND}>{`${step}. ${title}`}</legend>
      {hint !== undefined && <p className="mb-4 text-sm text-slate-500">{hint}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

/** A labelled control with its inline validation message underneath. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {hint !== undefined && <p className={HINT}>{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error !== undefined && (
        <p id={`${id}-error`} className={ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}

/** The same shape for a set of buttons, which no single `<label>` can own. */
export function FieldGroup({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <p id={`${id}-label`} className={LABEL}>
        {label}
      </p>
      {hint !== undefined && <p className={HINT}>{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error !== undefined && (
        <p id={`${id}-error`} className={ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * A numeric input that keeps the numeric draft immutable while still letting
 * the user type an in-progress value such as "1." or "-".
 *
 * `raw` is only trusted while it still parses back to the number the parent
 * holds; any other change to that number wins, so the field stays controlled.
 */
export function NumberField({
  id,
  value,
  onChange,
  min = 0,
  step,
  suffix,
  placeholder,
  invalid = false,
  ariaLabel,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const [raw, setRaw] = useState<string | null>(null);
  const shown = raw !== null && toNumber(raw) === value ? raw : numberToInput(value);

  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={shown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={invalid && id !== undefined ? `${id}-error` : undefined}
        className={[INPUT, suffix === undefined ? '' : 'pr-14', invalid ? INPUT_INVALID : ''].join(
          ' ',
        )}
        onChange={(event) => {
          setRaw(event.target.value);
          onChange(toNumber(event.target.value));
        }}
      />
      {suffix !== undefined && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** A pressed/unpressed pill used for radius, audience and buyer-type choices. */
export function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
    >
      {children}
    </button>
  );
}
