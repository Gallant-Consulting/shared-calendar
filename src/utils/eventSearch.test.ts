import { describe, expect, it } from 'vitest';
import type { Event } from '../types';
import {
  eventMatchesQuery,
  eventSearchHaystack,
  normalizeText,
  queryTokens,
} from './eventSearch';

function mkEvent(partial: Partial<Event> & Pick<Event, 'id' | 'title' | 'startDate' | 'endDate'>): Event {
  return {
    isAllDay: false,
    attendees: [{ name: 'Alex Beta', avatar: '' }],
    ...partial,
  };
}

describe('eventSearch', () => {
  it('normalizeText trims and collapses whitespace', () => {
    expect(normalizeText('  Foo   Bar  ')).toBe('foo bar');
  });

  it('queryTokens splits on whitespace', () => {
    expect(queryTokens('marketing  workshop')).toEqual(['marketing', 'workshop']);
  });

  it('eventMatchesQuery uses AND semantics across tokens', () => {
    const e = mkEvent({
      id: '1',
      title: 'Marketing Workshop',
      startDate: new Date(2026, 5, 1),
      endDate: new Date(2026, 5, 1, 12, 0),
    });
    expect(eventMatchesQuery(e, 'marketing workshop')).toBe(true);
    expect(eventMatchesQuery(e, 'marketing gala')).toBe(false);
  });

  it('matches tags and attendee names', () => {
    const byTag = mkEvent({
      id: '2',
      title: 'Meetup',
      tags: ['NETWORKING'],
      startDate: new Date(2026, 7, 1),
      endDate: new Date(2026, 7, 1, 12, 0),
    });
    expect(eventMatchesQuery(byTag, 'networking')).toBe(true);

    const byAttendee = mkEvent({
      id: '3',
      title: 'Lunch',
      attendees: [{ name: 'Jordan Lee', avatar: '' }],
      startDate: new Date(2026, 8, 1),
      endDate: new Date(2026, 8, 1, 12, 0),
    });
    expect(eventMatchesQuery(byAttendee, 'jordan')).toBe(true);
  });

  it('includes past-dated events when they match', () => {
    const past = mkEvent({
      id: 'past',
      title: 'Old Conference 2024',
      notes: 'archive',
      startDate: new Date(2024, 0, 10),
      endDate: new Date(2024, 0, 10, 17, 0),
    });
    expect(eventMatchesQuery(past, 'conference')).toBe(true);
    expect(eventSearchHaystack(past)).toContain('2024');
  });

  it('empty query tokens match nothing meaningful via eventMatchesQuery with empty string', () => {
    const e = mkEvent({
      id: '4',
      title: 'X',
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 1, 12, 0),
    });
    expect(eventMatchesQuery(e, '   ')).toBe(true);
  });
});
