import { useState } from 'react';
import { REGIONS } from '../../data/regions';
import { CATEGORIES } from '../../data/taxonomy';
import { useI18n } from '../../i18n/useI18n';
import type { CategoryId, RegionId } from '../../domain/types';
import { CheckboxGroup, Field } from './fields';
import { categoryLabel, regionLabel } from './labels';
import {
  BTN_PRIMARY,
  HEADING_CLASS,
  NOTICE_CLASS,
  PANEL_CLASS,
  SECTION_CLASS,
} from './styles';

/** Separator between the categories and regions echoed back under the form. */
const SELECTION_SEPARATOR = ' · ';

/** Add or remove one value without touching the array it was given. */
function toggle<T>(values: readonly T[], value: T): readonly T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

/** The supplier's own details. Demo only — nothing is sent and nothing is stored. */
function ListingFields({
  company,
  contact,
  onCompany,
  onContact,
}: {
  company: string;
  contact: string;
  onCompany: (next: string) => void;
  onContact: (next: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        id="listing-company"
        label={t('suppliers.listing.company', 'Company')}
        value={company}
        onChange={onCompany}
      />
      <Field
        id="listing-contact"
        label={t('suppliers.listing.contact', 'Contact (email or phone)')}
        value={contact}
        onChange={onContact}
      />
    </div>
  );
}

export function ListingForm() {
  const { t, loc } = useI18n();

  const [listing, setListing] = useState({ company: '', contact: '' });
  const [listedCategories, setListedCategories] = useState<readonly CategoryId[]>([]);
  const [listedRegions, setListedRegions] = useState<readonly RegionId[]>([]);
  const [listingSent, setListingSent] = useState(false);

  const selection = [
    ...listedCategories.map((id) => categoryLabel(id, loc)),
    ...listedRegions.map((id) => regionLabel(id, loc)),
  ];

  return (
    <section className={SECTION_CLASS} aria-labelledby="listed-supplier">
      <div className={`${PANEL_CLASS} p-6 sm:p-8`}>
        <h2 id="listed-supplier" className={HEADING_CLASS}>
          {t('suppliers.listing.title', 'Become a listed supplier')}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            'suppliers.listing.body',
            'Tell us what you supply and where you deliver, and campaigns in those categories will reach you first.',
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {t('suppliers.listing.demo', 'Demo only — this form sends nothing and stores nothing.')}
        </p>

        {listingSent ? (
          <p className={`mt-5 ${NOTICE_CLASS}`} role="status">
            {t(
              'suppliers.listing.thanks',
              'Thank you — in the real product we would be in touch within two working days.',
            )}
          </p>
        ) : (
          <form
            className="mt-5 space-y-5"
            aria-label={t('suppliers.listing.title', 'Become a listed supplier')}
            onSubmit={(event) => {
              event.preventDefault();
              setListingSent(true);
            }}
          >
            <ListingFields
              company={listing.company}
              contact={listing.contact}
              onCompany={(company) => setListing((prev) => ({ ...prev, company }))}
              onContact={(contact) => setListing((prev) => ({ ...prev, contact }))}
            />

            <CheckboxGroup
              legend={t('suppliers.listing.categories', 'Categories you supply')}
              idPrefix="listing-cat"
              options={CATEGORIES.map((category) => ({
                id: category.id,
                label: loc(category.name),
                icon: category.icon,
              }))}
              selected={listedCategories}
              onToggle={(id) => setListedCategories((prev) => toggle(prev, id))}
            />

            <CheckboxGroup
              legend={t('suppliers.listing.regions', 'Coverage regions')}
              idPrefix="listing-region"
              options={REGIONS.map((region) => ({ id: region.id, label: loc(region.name) }))}
              selected={listedRegions}
              onToggle={(id) => setListedRegions((prev) => toggle(prev, id))}
            />

            {selection.length > 0 && (
              <p className="text-xs text-slate-500">
                {t('suppliers.listing.selected', 'Selected')}:{' '}
                {selection.join(SELECTION_SEPARATOR)}
              </p>
            )}

            <button type="submit" className={BTN_PRIMARY}>
              {t('suppliers.listing.send', 'Send listing request')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
