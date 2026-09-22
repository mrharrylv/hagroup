import { dayCount } from '../../i18n/dayCount';
import { useI18n } from '../../i18n/useI18n';
import { ChipButton, Field, FieldGroup, FormSection, NumberField } from './fields';
import { TierEditor } from './TierEditor';
import { LENGTH_OPTIONS, type SectionProps } from './model';
import { INPUT, INPUT_INVALID, SELECT } from './styles';
import type { AudienceId, BuyerType, PriceTier } from '../../domain/types';

const AUDIENCES: readonly { id: AudienceId; en: string; key: string }[] = [
  { id: 'business', en: 'Business', key: 'audience.business' },
  { id: 'individual', en: 'Individuals', key: 'audience.individual' },
  { id: 'mixed', en: 'Everyone', key: 'audience.mixed' },
];

const BUYER_TYPES: readonly { id: BuyerType; en: string; key: string }[] = [
  { id: 'business', en: 'A business', key: 'create.field.asBusiness' },
  { id: 'individual', en: 'An individual', key: 'create.field.asIndividual' },
];

/** Step 3 — the discount ladder, the deadline, and demo-only contact details. */
export function PricingSection({
  draft,
  update,
  errorFor,
  onTiersChange,
  onReseedTiers,
}: SectionProps & {
  onTiersChange: (tiers: readonly PriceTier[]) => void;
  onReseedTiers: () => void;
}) {
  const { t, lang } = useI18n();
  const emailError = errorFor('contactEmail');
  const nameError = errorFor('organizerName');

  return (
    <FormSection
      step={3}
      title={t('create.pricing.title', 'Pricing and contact')}
      hint={t(
        'create.pricing.hint',
        'The ladder is the whole mechanic: the more the group commits, the lower everybody pays.',
      )}
    >
      <Field
        id="retailPricePerUnit"
        label={t('create.field.retail', 'Retail price per unit')}
        hint={t('create.field.retailHint', 'What one buyer alone would pay. Savings are measured against it.')}
        error={errorFor('retailPricePerUnit')}
      >
        <NumberField
          id="retailPricePerUnit"
          value={draft.retailPricePerUnit}
          step={0.01}
          suffix="€"
          invalid={errorFor('retailPricePerUnit') !== undefined}
          onChange={(retailPricePerUnit) => update({ retailPricePerUnit })}
        />
      </Field>

      <FieldGroup
        id="tierBasis"
        label={t('create.field.tierBasis', 'Tiers are measured by')}
        hint={t('create.field.tierBasisHint', 'Volume suits fuel and bulk goods; headcount suits per-drop delivery pricing.')}
      >
        <div className="flex flex-wrap gap-2">
          <ChipButton
            active={draft.tierBasis === 'units'}
            onClick={() => update({ tierBasis: 'units' })}
          >
            {t('create.field.byVolume', 'Total volume')}
          </ChipButton>
          <ChipButton
            active={draft.tierBasis === 'buyers'}
            onClick={() => update({ tierBasis: 'buyers' })}
          >
            {t('create.field.byBuyers', 'Number of buyers')}
          </ChipButton>
        </div>
      </FieldGroup>

      <FieldGroup
        id="tiers"
        label={t('create.field.tiers', 'Price ladder')}
        hint={t('create.field.tiersHint', 'At least three rows, so buyers can see where the next drop is.')}
      >
        <TierEditor
          tiers={draft.tiers}
          basis={draft.tierBasis}
          unit={draft.unit}
          retail={draft.retailPricePerUnit}
          error={errorFor('tiers')}
          onChange={onTiersChange}
          onReseed={onReseedTiers}
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="endsInDays"
          label={t('create.field.length', 'Campaign length')}
          error={errorFor('endsInDays')}
        >
          <select
            id="endsInDays"
            className={SELECT}
            value={String(draft.endsInDays)}
            onChange={(event) => update({ endsInDays: Number(event.target.value) })}
          >
            {LENGTH_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {dayCount(days, lang, t)}
              </option>
            ))}
          </select>
        </Field>

        <FieldGroup id="audience" label={t('create.field.audience', 'Open to')}>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((audience) => (
              <ChipButton
                key={audience.id}
                active={draft.audience === audience.id}
                onClick={() => update({ audience: audience.id })}
              >
                {t(audience.key, audience.en)}
              </ChipButton>
            ))}
          </div>
        </FieldGroup>
      </div>

      <hr className="border-slate-200" />

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {t(
          'create.contact.demoNote',
          'Demo only — contact details stay in this browser. Nothing is emailed, texted or sent to any supplier.',
        )}
      </p>

      <Field
        id="organizerName"
        label={t('create.field.contactName', 'Contact name')}
        error={nameError}
      >
        <input
          id="organizerName"
          type="text"
          className={`${INPUT} ${nameError === undefined ? '' : INPUT_INVALID}`}
          value={draft.organizerName}
          autoComplete="off"
          placeholder={t('create.field.contactNamePlaceholder', 'Ilze Bērziņa')}
          aria-invalid={nameError === undefined ? undefined : true}
          aria-describedby={nameError === undefined ? undefined : 'organizerName-error'}
          onChange={(event) => update({ organizerName: event.target.value })}
        />
      </Field>

      <FieldGroup id="organizerType" label={t('create.field.youAre', 'You are')}>
        <div className="flex flex-wrap gap-2">
          {BUYER_TYPES.map((type) => (
            <ChipButton
              key={type.id}
              active={draft.organizerType === type.id}
              onClick={() => update({ organizerType: type.id })}
            >
              {t(type.key, type.en)}
            </ChipButton>
          ))}
        </div>
      </FieldGroup>

      <Field
        id="organizerOrg"
        label={t('create.field.company', 'Company name')}
        hint={t('create.field.companyHint', 'Optional — leave blank if you are buying as an individual.')}
      >
        <input
          id="organizerOrg"
          type="text"
          className={INPUT}
          value={draft.organizerOrg}
          autoComplete="off"
          placeholder={t('create.field.companyPlaceholder', 'SIA Kurzemes Koks')}
          onChange={(event) => update({ organizerOrg: event.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="contactEmail" label={t('create.field.email', 'Email')} error={emailError}>
          <input
            id="contactEmail"
            type="email"
            className={`${INPUT} ${emailError === undefined ? '' : INPUT_INVALID}`}
            value={draft.contactEmail}
            autoComplete="off"
            placeholder={t('create.field.emailPlaceholder', 'demo@example.lv')}
            aria-invalid={emailError === undefined ? undefined : true}
            aria-describedby={emailError === undefined ? undefined : 'contactEmail-error'}
            onChange={(event) => update({ contactEmail: event.target.value })}
          />
        </Field>

        <Field
          id="contactPhone"
          label={t('create.field.phone', 'Phone')}
          hint={t('create.field.optional', 'Optional')}
        >
          <input
            id="contactPhone"
            type="tel"
            className={INPUT}
            value={draft.contactPhone}
            autoComplete="off"
            placeholder={t('create.field.phonePlaceholder', '+371 20 000 000')}
            onChange={(event) => update({ contactPhone: event.target.value })}
          />
        </Field>
      </div>
    </FormSection>
  );
}
