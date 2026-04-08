import { describe, expect, it } from 'vitest';
import { buildSubscribeUrl } from './subscribeApi';

describe('buildSubscribeUrl', () => {
  it('appends encoded email as query parameter', () => {
    const url = buildSubscribeUrl('https://example.com/webhook/subscribe', 'user+tag@domain.com');
    expect(url).toBe('https://example.com/webhook/subscribe?email=user%2Btag%40domain.com');
  });
});
