import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './events';

describe('events proxy', () => {
  beforeEach(() => {
    process.env.AIRTABLE_PAT = 'test_pat';
    process.env.AIRTABLE_BASE_ID = 'appsiGlVk94JBwqHG';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET returns mapped approved events payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            records: [
              {
                id: 'rec1',
                fields: {
                  'Event ID': 'evt-1',
                  Status: 'Approved',
                  Title: 'Launch',
                  'Start Date': '2026-03-20T13:00:00.000Z',
                  'End Date': '2026-03-20T14:00:00.000Z',
                  Tags: ['ESO'],
                  'All Day Event': false,
                  Notes: 'hello',
                  Location: 'Main Hall',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await handler(new Request('http://localhost/api/events'));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0]).toMatchObject({
      id: 'evt-1',
      title: 'Launch',
      tags: ['ESO'],
      notes: 'hello',
      location: 'Main Hall',
    });
  });

  it('POST writes a record and returns mapped event', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            records: [
              {
                id: 'rec_new',
                fields: {
                  'Event ID': 'evt-new',
                  Status: 'Pending',
                  Title: 'New Event',
                  'Start Date': '2026-03-20T13:00:00.000Z',
                  'End Date': '2026-03-20T14:00:00.000Z',
                  Tags: ['NETWORKING'],
                  'All Day Event': false,
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await handler(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'evt-new',
          title: 'New Event',
          startDate: '2026-03-20T13:00:00.000Z',
          endDate: '2026-03-20T14:00:00.000Z',
          isAllDay: false,
          attendees: [],
          notes: '',
          location: '',
          tags: ['NETWORKING'],
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.id).toBe('evt-new');
    expect(payload.tags).toEqual(['NETWORKING']);
  });
});
