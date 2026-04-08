/** GET webhook: `?email=` */
export function buildSubscribeUrl(baseUrl: string, email: string): string {
  const u = new URL(baseUrl);
  u.searchParams.set('email', email.trim());
  return u.toString();
}

export async function subscribeByEmail(baseUrl: string, email: string): Promise<Response> {
  return fetch(buildSubscribeUrl(baseUrl, email), { method: 'GET', mode: 'cors' });
}
