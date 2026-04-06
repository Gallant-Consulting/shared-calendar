import type { Event } from '../types';

/** Lowercase, trim, collapse internal whitespace. */
export function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Split on whitespace; empty query yields []. */
export function queryTokens(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter(Boolean);
}

function formatDateForSearch(d: Date): string {
  return [
    d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }),
    d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }),
    String(d.getFullYear()),
  ].join(' ');
}

/** Concatenate searchable fields for substring matching. */
export function eventSearchHaystack(event: Event): string {
  const parts: string[] = [
    event.title,
    event.notes,
    event.location,
    event.hostOrganization,
    event.link,
    ...(event.tags ?? []),
    ...event.attendees.map((a) => a.name),
    formatDateForSearch(event.startDate),
    formatDateForSearch(event.endDate),
  ];
  return normalizeText(parts.filter(Boolean).join(' '));
}

/** Every token must appear as a substring in the haystack (AND semantics). */
export function eventMatchesQuery(event: Event, query: string): boolean {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;

  const haystack = eventSearchHaystack(event);
  return tokens.every((t) => haystack.includes(t));
}
