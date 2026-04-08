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

  it('GET returns paginated { events, nextOffset } and maps approved rows', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
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
                host_name: 'Tech Guild',
                Image:
                  'https://files.elfsightcdn.com/eafe4a4d-3436-495d-b748-5bdce62d911d/37bea206-74bc-46c6-ac2e-248577a13134/2025-Women-in-Tech-Awards-114.jpg',
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await handler(new Request('http://localhost/api/events'));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.nextOffset).toBeNull();
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0]).toMatchObject({
      id: 'evt-1',
      title: 'Launch',
      notes: 'hello',
      location: 'Main Hall',
      hostOrganization: 'Tech Guild',
      imageUrl:
        'https://files.elfsightcdn.com/eafe4a4d-3436-495d-b748-5bdce62d911d/37bea206-74bc-46c6-ac2e-248577a13134/2025-Women-in-Tech-Awards-114.jpg',
    });
    expect(payload.events[0].tags).toBeUndefined();

    const airtableUrl = fetchMock.mock.calls[0][0] as string;
    expect(airtableUrl).toContain('maxRecords=100');
    expect(airtableUrl).toContain('sort%5B0%5D%5Bfield%5D=Start+Date');
    expect(airtableUrl).toContain('sort%5B0%5D%5Bdirection%5D=asc');
  });

  it('GET forwards Airtable offset as nextOffset and passes offset query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          records: [],
          offset: 'itrABC123/recXYZ',
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await handler(
      new Request('http://localhost/api/events?offset=itrPrev%2FrecOld&limit=50'),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.events).toEqual([]);
    expect(payload.nextOffset).toBe('itrABC123/recXYZ');

    const airtableUrl = fetchMock.mock.calls[0][0] as string;
    expect(airtableUrl).toContain('maxRecords=50');
    expect(airtableUrl).toMatch(/offset=/);
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
          notes: '',
          location: '',
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.id).toBe('evt-new');
    expect(payload.title).toBe('New Event');
  });
});
