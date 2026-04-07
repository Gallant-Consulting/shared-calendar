const EVENTS_TABLE = 'Events';

export const TABLES = {
  EVENTS_TABLE,
};

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

export type EventPayload = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  link?: string;
  notes?: string;
  hostOrganization?: string;
  location?: string;
  imageUrl?: string;
};

function asString(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function buildEventRecordFields(event: Partial<EventPayload>): Record<string, unknown> {
  return {
    'Event ID': event.id,
    Status: 'Pending',
    Title: event.title ?? '',
    'Start Date': event.startDate ?? '',
    'End Date': event.endDate ?? '',
    'All Day Event': Boolean(event.isAllDay),
    Location: event.location ?? '',
    Notes: event.notes ?? '',
    'Event URL': event.link ?? '',
  };
}

const EASTERN_TZ = 'America/New_York';

/** Airtable date-only values: interpret as midnight (00:00) on that calendar day in US Eastern. */
function utcIsoForEasternMidnight(ymd: string): string {
  const [y, mo, d] = ymd.split('-').map(Number);
  const start = Date.UTC(y, mo - 1, d - 1, 0, 0, 0);
  const end = Date.UTC(y, mo - 1, d + 2, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  for (let t = start; t < end; t += 60 * 1000) {
    const dt = new Date(t);
    const parts = Object.fromEntries(formatter.formatToParts(dt).map((p) => [p.type, p.value]));
    if (
      Number(parts.year) === y &&
      Number(parts.month) === mo &&
      Number(parts.day) === d &&
      Number(parts.hour) === 0 &&
      Number(parts.minute) === 0
    ) {
      return dt.toISOString();
    }
  }
  return new Date(Date.UTC(y, mo - 1, d, 5, 0, 0)).toISOString();
}

/** ISO string; date-only strings (YYYY-MM-DD) use Eastern midnight. */
function parseIsoDate(input: unknown): string {
  if (!input) return new Date().toISOString();
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return utcIsoForEasternMidnight(trimmed);
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  if (input instanceof Date) {
    return input.toISOString();
  }
  return new Date().toISOString();
}

/** First attachment URL from an Airtable attachments field, or undefined. */
function firstAttachmentUrl(value: unknown): string | undefined {
  if (value == null || !Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0];
  if (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    typeof (first as { url: string }).url === 'string'
  ) {
    return (first as { url: string }).url;
  }
  return undefined;
}

/** Plain https URL stored as text (e.g. long-form URL field), or undefined. */
function trimmedHttpsUrl(value: unknown): string | undefined {
  const s = typeof value === 'string' ? value.trim() : asString(value).trim();
  if (!s || !/^https?:\/\//i.test(s)) return undefined;
  return s;
}

/**
 * Airtable image fields may be: plain URL text, or attachment array with `{ url }`.
 * Tries URL string first, then attachment shape.
 */
function imageUrlFromFieldValue(value: unknown): string | undefined {
  const direct = trimmedHttpsUrl(value);
  if (direct) return direct;
  return firstAttachmentUrl(value);
}

/** Prefer Image URL, then Image / Flyer / Cover Image (text URL or attachments). */
function imageUrlFromFields(fields: Record<string, unknown>): string | undefined {
  return (
    trimmedHttpsUrl(fields['Image URL']) ??
    imageUrlFromFieldValue(fields['Image']) ??
    imageUrlFromFieldValue(fields['Flyer']) ??
    imageUrlFromFieldValue(fields['Cover Image'])
  );
}

export function isApprovedStatus(status: unknown): boolean {
  const normalized = asString(status).trim().toLowerCase();
  return normalized === 'approved' || normalized === 'apporoved';
}

export function mapRecordToEvent(record: AirtableRecord): EventPayload {
  const fields = record.fields;

  const eventId = asString(fields['Event ID']) || record.id;
  return {
    id: eventId,
    title: asString(fields.Title),
    startDate: parseIsoDate(fields['Start Date']),
    endDate: parseIsoDate(fields['End Date']),
    isAllDay: Boolean(fields['All Day Event']),
    link: asString(fields['Event URL']) || asString(fields['Payment Link']) || undefined,
    notes: asString(fields.Notes) || undefined,
    hostOrganization:
      asString(fields['host_name']).trim() ||
      asString(fields['Host Group']).trim() ||
      undefined,
    location: asString(fields.Location) || undefined,
    imageUrl: imageUrlFromFields(fields),
  };
}

export function mapEventToCreateFields(event: Partial<EventPayload>): Record<string, unknown> {
  return buildEventRecordFields(event);
}

export function mapEventToUpdateFields(event: Partial<EventPayload>): Record<string, unknown> {
  const fields = buildEventRecordFields(event);
  delete fields['Event ID'];
  return fields;
}
