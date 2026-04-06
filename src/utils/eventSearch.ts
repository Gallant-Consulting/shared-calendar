import type { Event } from '../types';
import { formatDateForSearchEastern } from './eventTime';

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


/** Concatenate searchable fields for substring matching. */
export function eventSearchHaystack(event: Event): string {
  const optionalFields = [event.notes, event.location, event.hostOrganization, event.link].filter(
    (x): x is string => Boolean(x),
  );
  const parts: string[] = [
    event.title,
    ...optionalFields,
    formatDateForSearchEastern(event.startDate),
    formatDateForSearchEastern(event.endDate),
  ];
  return normalizeText(parts.join(' '));
}

/** Every token must appear as a substring in the haystack (AND semantics). */
export function eventMatchesQuery(event: Event, query: string): boolean {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;

  const haystack = eventSearchHaystack(event);
  return tokens.every((t) => haystack.includes(t));
}
