import { LV_BUSINESS } from './lv/business';
import { LV_CAMPAIGN } from './lv/campaign';
import { LV_CREATE } from './lv/create';
import { LV_DETAIL } from './lv/detail';
import { LV_HOME } from './lv/home';
import { LV_SHELL } from './lv/shell';

/**
 * Latvian overrides for the English source strings.
 *
 * Every `t(key, english)` call carries its own English fallback, so a key that
 * is missing here renders the English text rather than a raw key. That is a
 * safe failure, and also an invisible one — a half-translated page still looks
 * like a page. `dictionary.test.ts` is what makes the gap visible: it walks
 * every `t()` call in the source and fails on any key this file cannot answer.
 *
 * Split by surface so the sections can be worked on independently.
 */
export const LV: Readonly<Record<string, string>> = {
  ...LV_SHELL,
  ...LV_CAMPAIGN,
  ...LV_DETAIL,
  ...LV_CREATE,
  ...LV_HOME,
  ...LV_BUSINESS,
};
