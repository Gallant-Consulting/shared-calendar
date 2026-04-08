import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Event } from '../types';
import { addEvent, getEvents, getEventsPage, updateEvent } from './eventsApi';

describe('eventsApi service contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getEventsPage maps one page and nextOffset', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          events: [
            {
              id: 'evt-1',
              title: 'Launch',
              startDate: '2026-03-20T13:00:00.000Z',
              endDate: '2026-03-20T14:00:00.000Z',
              isAllDay: false,
              notes: 'hello',
              location: 'Main Hall',
            },
          ],
          nextOffset: 'cursor-next',
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const page = await getEventsPage({ limit: 50 });
    expect(page.events).toHaveLength(1);
    expect(page.nextOffset).toBe('cursor-next');
    expect(page.events[0].startDate).toBeInstanceOf(Date);
    expect(page.events[0].location).toBe('Main Hall');
    expect(fetchMock.mock.calls[0][0]).toContain('limit=50');
  });

  it('getEvents follows pages until nextOffset is null', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              events: [
                {
                  id: 'evt-a',
                  title: 'A',
                  startDate: '2026-03-20T13:00:00.000Z',
                  endDate: '2026-03-20T14:00:00.000Z',
                  isAllDay: false,
                },
              ],
              nextOffset: 'off1',
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              events: [
                {
                  id: 'evt-b',
                  title: 'B',
                  startDate: '2026-03-21T13:00:00.000Z',
                  endDate: '2026-03-21T14:00:00.000Z',
                  isAllDay: false,
                },
              ],
              nextOffset: null,
            }),
            { status: 200 },
          ),
        ),
    );

    const events = await getEvents();
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.id)).toEqual(['evt-a', 'evt-b']);
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
