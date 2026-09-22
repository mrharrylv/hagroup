import { formatMoney, formatNumber } from '../../domain/dates';
import type { Lang } from '../../domain/types';

/** The mock bid a supplier is typing against one campaign. */
export interface BidForm {
  readonly sent: boolean;
  readonly supplier: string;
  readonly pricePerUnit: string;
  readonly leadTimeDays: string;
}

export const EMPTY_BID: BidForm = {
  sent: false,
  supplier: '',
  pricePerUnit: '',
  leadTimeDays: '',
};

/** Echo of what the supplier actually typed, so the mock confirmation is not a lie. */
export function bidSummary(form: BidForm, unit: string, dayLabel: string, lang: Lang): string {
  const price = Number.parseFloat(form.pricePerUnit);
  const days = Number.parseInt(form.leadTimeDays, 10);

  return [
    form.supplier.trim(),
    Number.isFinite(price) ? `${formatMoney(price, lang)} / ${unit}` : '',
    Number.isFinite(days) ? `${formatNumber(days, lang)} ${dayLabel}` : '',
  ]
    .filter((part) => part !== '')
    .join(' · ');
}
