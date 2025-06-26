import { Event } from './Event';

// Helper to parse M/D/YYYY HH:mm:ss to Date
function parseSheetDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  // Handles both M/D/YYYY and MM/DD/YYYY
  const [datePart, timePart] = dateStr.split(' ');
  if (!datePart || !timePart) return undefined;
  const [month, day, year] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

// Helper to format Date to M/D/YYYY HH:mm:ss
function formatSheetDate(date?: Date): string {
  if (!date) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Helper to parse TRUE/FALSE to boolean
function parseSheetBoolean(val: any): boolean {
  return val === true || val === 'TRUE';
}

// Helper to format boolean to TRUE/FALSE
function formatSheetBoolean(val?: boolean): string {
  return val ? 'TRUE' : 'FALSE';
}

// Convert a Google Sheet row (object) to an Event
export function sheetRowToEvent(row: Record<string, any>): Event {
  return {
    id: row.GUID || '',
    title: row.Title || '',
    startDate: parseSheetDate(row.startDateTime) || new Date(),
    endDate: parseSheetDate(row.endDateTime) || new Date(),
    isAllDay: parseSheetBoolean(row.isAllDay),
    tags: row.Tags ? row.Tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
    status: row.Status || undefined,
    repeatFrequency: row.repeatFrequency || undefined,
    repeatUntil: parseSheetDate(row.repeatUntil),
    hostOrganization: row.hostOrganization || undefined,
    isPaid: parseSheetBoolean(row.isPaid),
    cost: row.Cost || undefined,
    location: row.Location || undefined,
    description: row.Description || undefined,
    registrationUrl: row.RegistrationUrl || undefined,
    imageUrl: row.ImageUrl || undefined,
    eventUrl: row.EventUrl || undefined,
  };
}

// Convert an Event to a Google Sheet row (object)
export function eventToSheetRow(event: Event): Record<string, any> {
  return {
    GUID: event.id,
    Title: event.title,
    startDateTime: formatSheetDate(event.startDate),
    endDateTime: formatSheetDate(event.endDate),
    isAllDay: formatSheetBoolean(event.isAllDay),
    Tags: event.tags ? event.tags.join(', ') : '',
    Status: event.status || '',
    repeatFrequency: event.repeatFrequency || '',
    repeatUntil: formatSheetDate(event.repeatUntil),
    hostOrganization: event.hostOrganization || '',
    isPaid: formatSheetBoolean(event.isPaid),
    Cost: event.cost || '',
    Location: event.location || '',
    Description: event.description || '',
    RegistrationUrl: event.registrationUrl || '',
    ImageUrl: event.imageUrl || '',
    EventUrl: event.eventUrl || '',
  };
} 