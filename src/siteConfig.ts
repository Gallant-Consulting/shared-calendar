/** Static site copy and footer links (no remote settings API). */

/** GET `?email=` — upcoming-events mailing list (override in env for staging). */
export const SUBSCRIBE_WEBHOOK_URL =
  import.meta.env.VITE_SUBSCRIBE_WEBHOOK_URL ??
  'https://primary-production-9195.up.railway.app/webhook/subscribe';

export const FOOTER_LINKS: Array<{ text: string; url: string }> = [
  { text: 'Terms of Service', url: '#' },
  { text: 'Privacy Policy', url: '#' },
  { text: 'Cookie Policy', url: '#' },
];
