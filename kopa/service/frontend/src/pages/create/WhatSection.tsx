import { CATEGORIES, UNITS, unitById } from '../../data/taxonomy';
import { useI18n } from '../../i18n/useI18n';
import { Field, FormSection, NumberField } from './fields';
import type { SectionProps } from './model';
import { INPUT, INPUT_INVALID, SELECT, TEXTAREA } from './styles';
import type { CategoryId, UnitId } from '../../domain/types';

/** Step 1 — what is being bought, how much of it, and how it is counted. */
export function WhatSection({ draft, update, errorFor }: SectionProps) {
  const { lang, t, loc } = useI18n();
  // The short form: the suffix sits in a fixed 3.5rem gutter, and "cubic
  // metres" or "truckloads" would run straight over the number being typed.
  const unitSuffix = unitById(draft.unit)?.short[lang] ?? draft.unit;
  const titleError = errorFor('titleEn');

  return (
    <FormSection
      step={1}
      title={t('create.what.title', 'What')}
      hint={t(
        'create.what.hint',
        'Pick the product and set the goal. The goal is what unlocks the cheapest tier.',
      )}
    >
      <Field id="category" label={t('create.field.category', 'Product category')}>
        <select
          id="category"
          className={SELECT}
          value={draft.category}
          onChange={(event) => update({ category: event.target.value as CategoryId })}
        >
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {`${category.icon} ${loc(category.name)}`}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="titleEn"
        label={t('create.field.product', 'Product name')}
        hint={t('create.field.productHint', 'What buyers will scan on the map, e.g. "A1 wood pellets, 6 mm".')}
        error={titleError}
      >
        <input
          id="titleEn"
          type="text"
          className={`${INPUT} ${titleError === undefined ? '' : INPUT_INVALID}`}
          value={draft.titleEn}
          placeholder={t('create.field.productPlaceholder', 'A1 wood pellets, 6 mm')}
          aria-invalid={titleError === undefined ? undefined : true}
          aria-describedby={titleError === undefined ? undefined : 'titleEn-error'}
          onChange={(event) => update({ titleEn: event.target.value })}
        />
      </Field>

      <Field
        id="descriptionEn"
        label={t('create.field.description', 'Description')}
        hint={t('create.field.descriptionHint', 'Quality, delivery window, anything a supplier must quote against.')}
      >
        <textarea
          id="descriptionEn"
          className={TEXTAREA}
          rows={4}
          value={draft.descriptionEn}
          placeholder={t(
            'create.field.descriptionPlaceholder',
            'Delivery to yards in the catchment area during October. Pallets of 65 × 15 kg bags.',
          )}
          onChange={(event) => update({ descriptionEn: event.target.value })}
        />
      </Field>

      <Field
        id="unit"
        label={t('create.field.unit', 'Unit')}
        hint={t('create.field.unitHint', 'Everything — targets, tiers and prices — is counted in this unit.')}
      >
        <select
          id="unit"
          className={SELECT}
          value={draft.unit}
          onChange={(event) => update({ unit: event.target.value as UnitId })}
        >
          {UNITS.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {`${loc(unit.long)} (${loc(unit.short)})`}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="targetUnits"
          label={t('create.field.targetUnits', 'Total quantity wanted')}
          error={errorFor('targetUnits')}
        >
          <NumberField
            id="targetUnits"
            value={draft.targetUnits}
            suffix={unitSuffix}
            invalid={errorFor('targetUnits') !== undefined}
            onChange={(targetUnits) => update({ targetUnits })}
          />
        </Field>

        <Field
          id="targetBuyers"
          label={t('create.field.targetBuyers', 'Buyers wanted')}
          error={errorFor('targetBuyers')}
        >
          <NumberField
            id="targetBuyers"
            value={draft.targetBuyers}
            step={1}
            invalid={errorFor('targetBuyers') !== undefined}
            onChange={(targetBuyers) => update({ targetBuyers })}
          />
        </Field>
      </div>

      <Field
        id="ownUnits"
        label={t('create.field.ownUnits', 'Your own commitment')}
        hint={t('create.field.ownUnitsHint', 'Seeds the campaign so it does not open at zero. Set 0 if you are only organising.')}
        error={errorFor('ownUnits')}
      >
        <NumberField
          id="ownUnits"
          value={draft.ownUnits}
          suffix={unitSuffix}
          invalid={errorFor('ownUnits') !== undefined}
          onChange={(ownUnits) => update({ ownUnits })}
        />
      </Field>
    </FormSection>
  );
}
