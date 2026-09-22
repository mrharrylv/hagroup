import { cityById, citiesInRegion } from '../../data/cities';
import { REGIONS } from '../../data/regions';
import { useI18n } from '../../i18n/useI18n';
import { ChipButton, Field, FieldGroup, FormSection } from './fields';
import { PinMap } from './PinMap';
import { RADIUS_OPTIONS, type SectionProps } from './model';
import { SELECT } from './styles';

/** Step 2 — the pin and the catchment circle that define who can join. */
export function WhereSection({ draft, update, errorFor }: SectionProps) {
  const { t, loc } = useI18n();
  const city = cityById(draft.cityId);

  function pickCity(cityId: string) {
    const next = cityById(cityId);
    update({
      cityId,
      lat: next?.lat ?? draft.lat,
      lng: next?.lng ?? draft.lng,
    });
  }

  return (
    <FormSection
      step={2}
      title={t('create.where.title', 'Where')}
      hint={t(
        'create.where.hint',
        'Buyers inside the circle see the campaign first. Click the map or drag the pin to move it.',
      )}
    >
      <Field id="cityId" label={t('create.field.city', 'Nearest city or town')}>
        <select
          id="cityId"
          className={SELECT}
          value={draft.cityId}
          onChange={(event) => pickCity(event.target.value)}
        >
          {REGIONS.map((region) => (
            <optgroup key={region.id} label={loc(region.name)}>
              {citiesInRegion(region.id).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <div>
        <div className="h-72 overflow-hidden rounded-xl border border-slate-200">
          <PinMap
            lat={draft.lat}
            lng={draft.lng}
            radiusKm={draft.radiusKm}
            category={draft.category}
            cityId={draft.cityId}
            onPick={(lat, lng) => update({ lat, lng })}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {t('create.where.pin', 'Pin')}:{' '}
          <span className="font-medium text-slate-700 tabular-nums">
            {draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}
          </span>{' '}
          · {city?.name ?? draft.cityId} ·{' '}
          {t('create.where.pinHint', 'click the map or drag the pin to move it')}
        </p>
      </div>

      <FieldGroup
        id="radiusKm"
        label={t('create.field.radius', 'Catchment radius')}
        hint={t('create.field.radiusHint', 'How far a buyer can be and still make delivery worthwhile.')}
        error={errorFor('radiusKm')}
      >
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((radius) => (
            <ChipButton
              key={radius}
              active={draft.radiusKm === radius}
              onClick={() => update({ radiusKm: radius })}
            >
              {`${radius} km`}
            </ChipButton>
          ))}
        </div>
      </FieldGroup>
    </FormSection>
  );
}
