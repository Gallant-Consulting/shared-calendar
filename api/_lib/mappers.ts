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
  attendees: Array<{ name: string; avatar: string }>;
  link?: string;
  repeat?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    until?: string;
  };
  notes?: string;
  hostOrganization?: string;
  location?: string;
  tags?: string[];
};

export type SettingsPayload = {
  site_title: string;
  site_description: string;
  tags: string[];
  tag_labels: Record<string, string>;
  contact_email: string;
  footer_links: Array<{ text: string; url: string }>;
};

export const DEFAULT_SETTINGS: SettingsPayload = {
  site_title: 'Central VA ESO Calendar',
  site_description: 'A shared calendar for ESO practitioners.',
  tags: ['ESO', 'PAID', 'NETWORKING'],
  tag_labels: {
    ESO: 'ESO Event',
    PAID: 'Paid Event',
    NETWORKING: 'Networking Event',
  },
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

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function parseTagLabels(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, string>;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, string>;
      }
    } catch {
      const output: Record<string, string> = {};
      value.split(',').forEach((pair) => {
        const [k, v] = pair.split(':').map((s) => s.trim());
        if (k && v) output[k] = v;
      });
      return output;
    }
  }
  return {};
}

function buildEventRecordFields(event: Partial<EventPayload>): Record<string, unknown> {
  return {
    'Event ID': event.id,
    Status: 'Pending',
    Title: event.title ?? '',
    'Start Date': event.startDate ?? '',
    'End Date': event.endDate ?? '',
    Tags: event.tags ?? [],
    'All Day Event': Boolean(event.isAllDay),
    'Repeat Frequency': event.repeat?.frequency && event.repeat.frequency !== 'none' ? event.repeat.frequency : '',
    'Repeat Until': event.repeat?.until ?? '',
    Location: event.location ?? '',
    Notes: event.notes ?? '',
    'Event URL': event.link ?? '',
  };
}

function parseIsoDate(input: unknown): string {
  if (!input) return new Date().toISOString();
  if (typeof input === 'string') {
    const parsed = new Date(input);
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
  const frequency = asString(fields['Repeat Frequency']).toLowerCase();
  const repeatFrequency =
    frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly' || frequency === 'yearly'
      ? (frequency as 'daily' | 'weekly' | 'monthly' | 'yearly')
      : 'none';

  const eventId = asString(fields['Event ID']) || record.id;
  return {
    id: eventId,
    title: asString(fields.Title),
    startDate: parseIsoDate(fields['Start Date']),
    endDate: parseIsoDate(fields['End Date']),
    isAllDay: Boolean(fields['All Day Event']),
    attendees: [],
    link: asString(fields['Event URL']) || asString(fields['Payment Link']) || undefined,
    repeat:
      repeatFrequency === 'none'
        ? undefined
        : {
            frequency: repeatFrequency,
            until: asString(fields['Repeat Until']) || undefined,
          },
    notes: asString(fields.Notes) || undefined,
    hostOrganization: asString(fields['Host Group']) || undefined,
    location: asString(fields.Location) || undefined,
    tags: asStringArray(fields.Tags).map((tag) => tag.toUpperCase()),
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
  const tags = asStringArray(fields.tags);
  const tagLabels = parseTagLabels(fields.tag_labels);

  return {
    site_title: asString(fields.site_title) || DEFAULT_SETTINGS.site_title,
    site_description: asString(fields.site_description) || DEFAULT_SETTINGS.site_description,
    tags: tags.length > 0 ? tags : DEFAULT_SETTINGS.tags,
    tag_labels: Object.keys(tagLabels).length > 0 ? tagLabels : DEFAULT_SETTINGS.tag_labels,
    contact_email: asString(fields.contact_email),
    footer_links: DEFAULT_SETTINGS.footer_links,
  };
}

export function mapSettingsToFields(settings: SettingsPayload): Record<string, unknown> {
  return {
    site_title: settings.site_title,
    site_description: settings.site_description,
    contact_email: settings.contact_email,
    tags: settings.tags,
    tag_labels: JSON.stringify(settings.tag_labels),
  };
}
