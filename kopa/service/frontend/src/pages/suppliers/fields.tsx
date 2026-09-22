import { INPUT_CLASS } from './styles';

/** One labelled input. Every field on this page is required — the forms are mock. */
export function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  min,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: 'text' | 'number';
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        required
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </div>
  );
}

export function CheckboxGroup<T extends string>({
  legend,
  idPrefix,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  idPrefix: string;
  options: readonly { id: T; label: string; icon?: string }[];
  selected: readonly T[];
  onToggle: (id: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-slate-600">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
        {options.map((option) => (
          <label
            key={option.id}
            htmlFor={`${idPrefix}-${option.id}`}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            <input
              id={`${idPrefix}-${option.id}`}
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => onToggle(option.id)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-300"
            />
            {option.icon !== undefined && <span aria-hidden="true">{option.icon}</span>}
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
