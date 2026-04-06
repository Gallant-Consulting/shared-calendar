import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSettings, updateSettings } from './settingsApi';

describe('settingsApi service contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getSettings returns normalized settings payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            site_title: 'A',
            site_description: 'B',
            tags: ['ESO'],
            tag_labels: { ESO: 'ESO Hosted' },
            contact_email: 'hi@example.com',
            footer_links: [],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );

    const settings = await getSettings();
    expect(settings.site_title).toBe('A');
    expect(settings.tags).toEqual(['ESO']);
    expect(settings.tag_labels).toEqual({ ESO: 'ESO Hosted' });
  });

  it('updateSettings sends payload to proxy and succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );

    await expect(
      updateSettings({
        site_title: 'Title',
        site_description: 'Desc',
        tags: ['ESO'],
        tag_labels: { ESO: 'ESO Hosted' },
        contact_email: 'owner@example.com',
        footer_links: [{ text: 'Terms', url: '#' }],
      }),
    ).resolves.toBeUndefined();
  });

  it('getSettings falls back when API returns non-JSON content', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<!doctype html><html><body>fallback</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      ),
    );

    const settings = await getSettings();

    expect(settings.site_title).toBe('Central VA ESO Calendar');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('non-JSON response'),
      expect.any(Object),
    );
  });
});
