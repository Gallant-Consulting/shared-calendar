/** Start of the user's local calendar day (matches `dayKeyLocal` in EventList). */
export function localCalendarDayStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Pick which local calendar day the schedule list should scroll to on first load:
 * first event starting on/after today, else first still-ongoing event, else first row.
 */
export function pickInitialListScrollDay(
  events: { startDate: Date; endDate: Date }[],
  now: Date = new Date(),
): Date | null {
  if (events.length === 0) return null;
  const todayStart = localCalendarDayStart(now);

  const futureOrTodayStart = events.find(
    (e) => localCalendarDayStart(e.startDate).getTime() >= todayStart.getTime(),
  );
  if (futureOrTodayStart) {
    return localCalendarDayStart(futureOrTodayStart.startDate);
  }

  const ongoing = events.find((e) => e.endDate >= todayStart);
  const anchor = ongoing ?? events[0];
  return localCalendarDayStart(anchor.startDate);
}
