import { describe, expect, it } from 'vitest';
import {
  EVENT_TIME_ZONE,
  easternWallClockToUtc,
  formatDateInputEastern,
  formatEventTimeEastern,
} from './eventTime';

describe('eventTime', () => {
  it('exports Eastern IANA zone', () => {
    expect(EVENT_TIME_ZONE).toBe('America/New_York');
  });

  it('easternWallClockToUtc round-trips a wall-clock instant', () => {
    const d = easternWallClockToUtc('2026-07-15', '14:30');
    expect(d.toISOString()).toMatch(/^2026-07-15T\d{2}:30:00\.000Z$/);
    expect(formatDateInputEastern(d)).toBe('2026-07-15');
    expect(formatEventTimeEastern(d)).toMatch(/2:30/);
  });
});
