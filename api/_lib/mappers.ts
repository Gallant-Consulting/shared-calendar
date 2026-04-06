const EVENTS_TABLE = 'Events';
const SETTINGS_TABLE = 'app_settings';

export const TABLES = {
  EVENTS_TABLE,
  SETTINGS_TABLE,
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
};

export type SettingsPayload = {
  site_title: string;
  site_description: string;
  contact_email: string;
  footer_links: Array<{ text: string; url: string }>;
};

export const DEFAULT_SETTINGS: SettingsPayload = {
  site_title: 'Central VA ESO Calendar',
  site_description: 'A shared calendar for ESO practitioners.',
  contact_email: '',
  footer_links: [
    { text: 'Terms of Service', url: '#' },
    { text: 'Privacy Policy', url: '#' },
    { text: 'Cookie Policy', url: '#' },
  ],
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
    hostOrganization: asString(fields['Host Group']) || undefined,
    location: asString(fields.Location) || undefined,
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

export function mapRecordToSettings(record: AirtableRecord | null): SettingsPayload {
  if (!record) return DEFAULT_SETTINGS;
  const fields = record.fields;

  return {
    site_title: asString(fields.site_title) || DEFAULT_SETTINGS.site_title,
    site_description: asString(fields.site_description) || DEFAULT_SETTINGS.site_description,
    contact_email: asString(fields.contact_email),
    footer_links: DEFAULT_SETTINGS.footer_links,
  };
}

export function mapSettingsToFields(settings: SettingsPayload): Record<string, unknown> {
  return {
    site_title: settings.site_title,
    site_description: settings.site_description,
    contact_email: settings.contact_email,
  };
}
