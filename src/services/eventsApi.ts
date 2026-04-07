import type { Event } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
const EVENTS_API_PATH = `${API_BASE}/api/events`;

type EventDto = {
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

function toDate(input?: string): Date {
  if (!input) return new Date();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function mapDtoToEvent(dto: EventDto): Event {
  return {
    id: dto.id,
    title: dto.title,
    startDate: toDate(dto.startDate),
    endDate: toDate(dto.endDate),
    isAllDay: Boolean(dto.isAllDay),
    link: dto.link,
    notes: dto.notes,
    hostOrganization: dto.hostOrganization,
    location: dto.location,
    imageUrl: dto.imageUrl,
  };
}

function mapEventToDto(event: Partial<Event>): EventDto {
  const generatedId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return {
    id: event.id ?? generatedId,
    title: event.title ?? '',
    startDate: event.startDate ? new Date(event.startDate).toISOString() : new Date().toISOString(),
    endDate: event.endDate ? new Date(event.endDate).toISOString() : new Date().toISOString(),
    isAllDay: Boolean(event.isAllDay),
    link: event.link,
    notes: event.notes,
    hostOrganization: event.hostOrganization,
    location: event.location,
    imageUrl: event.imageUrl,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function getEvents(): Promise<Event[]> {
  const response = await fetch(EVENTS_API_PATH);
  const payload = await parseResponse<EventDto[]>(response);
  return payload.map(mapDtoToEvent);
}

export async function addEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const dto = mapEventToDto(event);
  const response = await fetch(EVENTS_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const payload = await parseResponse<EventDto>(response);
  return mapDtoToEvent(payload);
}

export async function updateEvent(event: Event): Promise<Event> {
  const dto = mapEventToDto(event);
  const response = await fetch(EVENTS_API_PATH, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const payload = await parseResponse<EventDto>(response);
  return mapDtoToEvent(payload);
}

export async function deleteEvent(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${EVENTS_API_PATH}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return parseResponse<{ success: boolean }>(response);
}
