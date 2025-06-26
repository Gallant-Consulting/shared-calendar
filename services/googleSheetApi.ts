import { sheetRowToEvent, eventToSheetRow } from '../components/eventMapping';
import { Event } from '../components/Event';

const BASE_URL = import.meta.env.VITE_REACT_APP_SHEET_API_URL;
const TAB_ID = 'Event Data';

// Helper to build URL with tabId
function buildUrl(params: string = ''): string {
  return `${BASE_URL}?tabId=${encodeURIComponent(TAB_ID)}${params}`;
}

// Fetch all events and their row numbers
export async function getEvents(): Promise<{ events: Event[]; rowIds: number[] }> {
  const res = await fetch(buildUrl());
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  // data.data is an array of rows, each with a __rowNum__ property
  const events: Event[] = [];
  const rowIds: number[] = [];
  for (const row of data.data) {
    events.push(sheetRowToEvent(row));
    rowIds.push(row.__rowNum__);
  }
  return { events, rowIds };
}

// Add a new event
export async function addEvent(event: Event): Promise<void> {
  const row = eventToSheetRow(event);
  const res = await fetch(buildUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([Object.values(row)]) // NocodeAPI expects array of arrays
  });
  if (!res.ok) throw new Error('Failed to add event');
}

// Update an event by rowId
export async function updateEvent(rowId: number, event: Event): Promise<void> {
  const row = eventToSheetRow(event);
  const res = await fetch(buildUrl(`&rowId=${rowId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.values(row))
  });
  if (!res.ok) throw new Error('Failed to update event');
}

// Delete an event by rowId
export async function deleteEvent(rowId: number): Promise<void> {
  const res = await fetch(buildUrl(`&rowId=${rowId}`), {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete event');
} 