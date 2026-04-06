import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './settings';

describe('settings proxy', () => {
  beforeEach(() => {
    process.env.AIRTABLE_PAT = 'test_pat';
    process.env.AIRTABLE_BASE_ID = 'appsiGlVk94JBwqHG';
    vi.restoreAllMocks();
  });

  it('GET maps app_settings row to frontend settings shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            records: [
              {
                id: 'rec_settings',
                fields: {
                  site_title: 'My Site',
                  site_description: 'Desc',
                  contact_email: 'owner@example.com',
                  tags: ['ESO', 'PAID'],
                  tag_labels: '{"ESO":"ESO Hosted","PAID":"Paid"}',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await handler(new Request('http://localhost/api/settings'));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.site_title).toBe('My Site');
    expect(payload.site_description).toBe('Desc');
    expect(payload.contact_email).toBe('owner@example.com');
    expect(payload.tags).toBeUndefined();
    expect(payload.tag_labels).toBeUndefined();
  });
});
