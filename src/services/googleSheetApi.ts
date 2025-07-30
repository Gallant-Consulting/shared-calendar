// Environment variable for the API endpoint
const NOCODE_API_ENDPOINT = import.meta.env.VITE_NOCODE_API_ENDPOINT || 'YOUR_NOCODEAPI_ENDPOINT_HERE';
const SHEET_TAB = 'Event_Data';

// Debug log to show current configuration
// console.log('API Configuration:', {
//   endpoint: NOCODE_API_ENDPOINT,
//   isConfigured: NOCODE_API_ENDPOINT !== 'YOUR_NOCODEAPI_ENDPOINT_HERE',
//   envValue: import.meta.env.VITE_NOCODE_API_ENDPOINT
// });

// Generate a GUID for new events
function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Sample data for testing when API is not configured
const SAMPLE_EVENTS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Startup Networking Mixer',
    startDate: new Date('2024-01-15T18:00:00'),
    endDate: new Date('2024-01-15T20:00:00'),
    isAllDay: false,
    attendees: [{ name: 'John Doe', avatar: '' }, { name: 'Jane Smith', avatar: '' }],
    link: 'https://meet.google.com/abc-defg-hij',
    repeat: undefined,
    notes: 'Monthly networking event for local startups',
    hostOrganization: 'Central VA Startup Hub',
    location: 'Downtown Richmond',
    tags: ['NETWORKING', 'ESO'],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Pitch Competition',
    startDate: new Date('2024-01-20T14:00:00'),
    endDate: new Date('2024-01-20T17:00:00'),
    isAllDay: false,
    attendees: [{ name: 'Bob Johnson', avatar: '' }],
    link: undefined,
    repeat: undefined,
    notes: 'Annual startup pitch competition with $10k prize',
    hostOrganization: 'VA Innovation Hub',
    location: 'VCU Innovation Center',
    tags: ['PAID', 'ESO'],
  },
];

// Helper to parse attendees and tags from CSV
function parseCSV(str: string): string[] {
  return str ? str.split(',').map(s => s.trim()) : [];
}

// Helper to handle API errors
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      // Try to parse as JSON for better error messages
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If not JSON, use the text directly
      if (text.includes('<!doctype')) {
        errorMessage = 'Invalid API endpoint or server error. Please check your configuration.';
      } else {
        errorMessage = text || errorMessage;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export async function getEvents() {
  if (NOCODE_API_ENDPOINT === 'YOUR_NOCODEAPI_ENDPOINT_HERE') {
    // console.warn('API endpoint not configured. Using sample data for testing.');
    return SAMPLE_EVENTS;
  }

  // console.log('Fetching events from:', NOCODE_API_ENDPOINT);
  const res = await fetch(`${NOCODE_API_ENDPOINT}?tabId=${encodeURIComponent(SHEET_TAB)}`);
  // console.log('API Response status:', res.status, res.statusText);

  const apiResponse = await handleApiResponse(res);
  // Use apiResponse.data if present, otherwise fallback to apiResponse
  const rows = Array.isArray(apiResponse) ? apiResponse : apiResponse.data;
  // console.log('Total rows from API:', rows.length);
  // console.log('All rows with their status:', rows.map((row: any) => ({
  //   id: row.id,
  //   title: row.title,
  //   status: row.status,
  //   startDate: row.startDate
  // })));

  // Only include events with status 'approved' (case-insensitive) in column A
  const approvedRows = rows.filter((row: any) => {
    const status = (row.status || '').toString().trim().toLowerCase();
    // console.log(`Row "${row.title}" has status: "${status}" (approved: ${status === 'approved'})`);
    return status === 'approved';
  });

  // console.log('Approved rows count:', approvedRows.length);
  // console.log('Approved events:', approvedRows.map((row: any) => ({
  //   id: row.id,
  //   title: row.title,
  //   startDate: row.startDate
  // })));

  // Map rows to event objects
  return approvedRows.map((row: any) => {
    // Parse dates properly to avoid timezone issues
    const parseDate = (dateStr: string) => {
      if (!dateStr) return new Date();
      // If it's just a date string (YYYY-MM-DD), create it in local timezone
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      }
      return new Date(dateStr);
    };

    return {
      id: row.id || generateGuid(),
      title: row.title,
      startDate: parseDate(row.startDate),
      endDate: parseDate(row.endDate),
      isAllDay: row.isAllDay === 'TRUE' || row.isAllDay === 'true' || row.isAllDay === true,
      attendees: parseCSV(row.attendees).map((name: string) => ({ name, avatar: '' })),
      link: row.link,
      repeat: row.repeat || undefined,
      notes: row.notes,
      hostOrganization: row.hostOrganization,
      location: row.location,
      tags: Array.isArray(row.tags)
        ? row.tags.map((t: string) => t.toUpperCase())
        : parseCSV(row.tags).map((t: string) => t.toUpperCase()),
    };
  });
}

export async function addEvent(event: any) {
  // Generate a GUID for the new event
  const eventWithGuid = { ...event, id: generateGuid() };
  
  if (NOCODE_API_ENDPOINT === 'YOUR_NOCODEAPI_ENDPOINT_HERE') {
    // console.warn('API endpoint not configured. Event not saved to backend.');
    return eventWithGuid;
  }
  
  // Convert event object to array format expected by NocodeAPI
  // Column order: status, tags, id, title, startDate, endDate, isAllDay, repeat, repeatUntil, 
  // hostOrganization, isPaid, cost, location, notes, link, image, eventUrl
  const rowData = [
    "", // status (empty for new events - needs approval)
    eventWithGuid.tags ? eventWithGuid.tags.join(', ') : "", // tags
    eventWithGuid.id, // id
    eventWithGuid.title, // title
    eventWithGuid.startDate ? eventWithGuid.startDate.toISOString().split('T')[0] : "", // startDate
    eventWithGuid.endDate ? eventWithGuid.endDate.toISOString().split('T')[0] : "", // endDate
    eventWithGuid.isAllDay ? "TRUE" : "FALSE", // isAllDay
    eventWithGuid.repeat?.frequency || "", // repeat
    eventWithGuid.repeat?.until ? eventWithGuid.repeat.until.toISOString().split('T')[0] : "", // repeatUntil
    eventWithGuid.hostOrganization || "", // hostOrganization
    "", // isPaid (empty for now)
    "", // cost (empty for now)
    eventWithGuid.location || "", // location
    eventWithGuid.notes || "", // notes
    eventWithGuid.link || "", // link
    "", // image (empty for now)
    "" // eventUrl (empty for now)
  ];
  
  const res = await fetch(`${NOCODE_API_ENDPOINT}?tabId=${encodeURIComponent(SHEET_TAB)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([rowData]), // Wrap in array as expected by API
  });
  return await handleApiResponse(res);
}

export async function updateEvent(event: any) {
  if (NOCODE_API_ENDPOINT === 'YOUR_NOCODEAPI_ENDPOINT_HERE') {
    // console.warn('API endpoint not configured. Event not updated in backend.');
    return event;
  }
  
  const res = await fetch(`${NOCODE_API_ENDPOINT}?tabId=${encodeURIComponent(SHEET_TAB)}&id=${event.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return await handleApiResponse(res);
}

export async function deleteEvent(id: string) {
  if (NOCODE_API_ENDPOINT === 'YOUR_NOCODEAPI_ENDPOINT_HERE') {
    // console.warn('API endpoint not configured. Event not deleted from backend.');
    return { success: true };
  }
  
  const res = await fetch(`${NOCODE_API_ENDPOINT}?tabId=${encodeURIComponent(SHEET_TAB)}&id=${id}`, {
    method: 'DELETE',
  });
  return await handleApiResponse(res);
} 