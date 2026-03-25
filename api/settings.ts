import { createRecord, listRecords, updateRecord } from './_lib/airtable';
import { mapRecordToSettings, mapSettingsToFields, TABLES, type SettingsPayload } from './_lib/mappers';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function text(message: string, status = 400): Response {
  return new Response(message, { status });
}

export default async function handler(request: Request): Promise<Response> {
  try {
    if (request.method === 'GET') {
      const records = await listRecords(TABLES.SETTINGS_TABLE, { maxRecords: 1 });
      const payload = mapRecordToSettings(records[0] || null);
      return json(payload);
    }

    if (request.method === 'PUT') {
      const incoming = (await request.json()) as SettingsPayload;
      const records = await listRecords(TABLES.SETTINGS_TABLE, { maxRecords: 1 });
      const fields = mapSettingsToFields(incoming);

      if (records[0]) {
        await updateRecord(TABLES.SETTINGS_TABLE, records[0].id, fields);
      } else {
        await createRecord(TABLES.SETTINGS_TABLE, fields);
      }

      return new Response(null, { status: 200 });
    }

    return text('Method not allowed', 405);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return text(message, 500);
  }
}
