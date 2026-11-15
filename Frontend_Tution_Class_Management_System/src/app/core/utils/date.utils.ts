/**
 * Date helpers that work in the user's LOCAL time zone.
 *
 * `new Date().toISOString()` is UTC, so in Sri Lanka (UTC+5:30) it returns
 * yesterday's date between midnight and 05:30 - these helpers avoid that.
 */

/** yyyy-MM-dd for the given date, in local time. */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today as yyyy-MM-dd (local). */
export function todayIso(): string {
  return toLocalIsoDate(new Date());
}

/** The date `days` days ago as yyyy-MM-dd (local). */
export function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalIsoDate(d);
}

/** Current month as yyyy-MM (local), the format used for billing periods. */
export function currentMonthIso(): string {
  return todayIso().slice(0, 7);
}

/** Backend DayOfWeek name (MONDAY..SUNDAY) for today. */
export function todayDayName(): string {
  return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()];
}

/** "Good morning" / "Good afternoon" / "Good evening" for the current local hour. */
export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
