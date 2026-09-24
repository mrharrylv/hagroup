const LONG_DATE: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

/**
 * Formats a calendar date ('2026-07-15', optionally with a time) the same way
 * on the build machine and in every browser: the date is read and printed in
 * UTC, so no time zone can move it to the day before. A value that is not a
 * date is returned as it is rather than as "Invalid Date".
 */
export function formatCalendarDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = LONG_DATE,
): string {
  const day = /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1];
  if (!day) return value;
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { ...options, timeZone: 'UTC' });
}
