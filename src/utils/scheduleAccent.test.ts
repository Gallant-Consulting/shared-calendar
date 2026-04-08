import { describe, expect, it } from 'vitest';
import type { Event } from '../types';
import {
  getScheduleAccentColor,
  SCHEDULE_EVENT_ACCENT_COLORS,
  SCHEDULE_PRIMARY_ACCENT,
} from './scheduleAccent';

function ev(
  id: string,
  start: Date,
): Event {
  return { id, title: id, startDate: start, endDate: start, isAllDay: false };
}

describe('schedule accents', () => {
  it('uses the first rotation color as primary chrome accent', () => {
    expect(SCHEDULE_PRIMARY_ACCENT).toBe(SCHEDULE_EVENT_ACCENT_COLORS[0]);
  });
});

describe('getScheduleAccentColor', () => {
  it('cycles pink, amber, cyan in month-group order', () => {
    const march1 = ev('a', new Date(2026, 2, 10, 10, 0));
    const march2 = ev('b', new Date(2026, 2, 20, 10, 0));
    const april1 = ev('c', new Date(2026, 3, 5, 10, 0));
    const ordered = [march1, march2, april1];

    expect(getScheduleAccentColor(march1, ordered)).toBe(SCHEDULE_EVENT_ACCENT_COLORS[0]);
    expect(getScheduleAccentColor(march2, ordered)).toBe(SCHEDULE_EVENT_ACCENT_COLORS[1]);
    expect(getScheduleAccentColor(april1, ordered)).toBe(SCHEDULE_EVENT_ACCENT_COLORS[2]);
  });
});
