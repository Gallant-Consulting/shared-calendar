import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Event } from '../types';
import { addEvent, getEvents, updateEvent } from './eventsApi';

describe('eventsApi service contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getEvents maps proxy response into Event[] with Date objects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: 'evt-1',
              title: 'Launch',
              startDate: '2026-03-20T13:00:00.000Z',
              endDate: '2026-03-20T14:00:00.000Z',
              isAllDay: false,
              notes: 'hello',
              location: 'Main Hall',
            },
          ]),
          { status: 200 },
        ),
      ),
    );

    const events = await getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].startDate).toBeInstanceOf(Date);
    expect(events[0].location).toBe('Main Hall');
  });

  it('addEvent and updateEvent return Event-shaped payload', async () => {
    const base = {
      id: 'evt-2',
      title: 'Event',
      startDate: '2026-03-20T13:00:00.000Z',
      endDate: '2026-03-20T14:00:00.000Z',
      isAllDay: false,
      notes: '',
      location: '',
    };
    const eventInput: Event = {
      ...base,
      startDate: new Date(base.startDate),
      endDate: new Date(base.endDate),
    };
    const createInput: Omit<Event, 'id'> = {
      title: eventInput.title,
      startDate: eventInput.startDate,
      endDate: eventInput.endDate,
      isAllDay: eventInput.isAllDay,
      notes: eventInput.notes,
      location: eventInput.location,
      link: eventInput.link,
      hostOrganization: eventInput.hostOrganization,
    };

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(base), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(base), { status: 200 })),
    );

    const created = await addEvent(createInput);
    const updated = await updateEvent(eventInput);
    expect(created.id).toBe('evt-2');
    expect(updated.id).toBe('evt-2');
  });
});
