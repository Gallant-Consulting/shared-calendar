type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableListResponse = {
  records: AirtableRecord[];
  offset?: string;
};

const AIRTABLE_API_ROOT = 'https://api.airtable.com/v0';

function getEnv(name: 'AIRTABLE_PAT' | 'AIRTABLE_BASE_ID'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildTableUrl(tableName: string): string {
  const baseId = getEnv('AIRTABLE_BASE_ID');
  return `${AIRTABLE_API_ROOT}/${baseId}/${encodeURIComponent(tableName)}`;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getEnv('AIRTABLE_PAT')}`,
    'Content-Type': 'application/json',
  };
}

async function airtableFetch(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Airtable request failed (${response.status}): ${body}`);
  }

  return response;
}

export async function listRecords(
  tableName: string,
  options?: {
    filterByFormula?: string;
    maxRecords?: number;
  },
): Promise<AirtableRecord[]> {
  const all: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(buildTableUrl(tableName));
    if (options?.filterByFormula) {
      url.searchParams.set('filterByFormula', options.filterByFormula);
    }
    if (options?.maxRecords) {
      url.searchParams.set('maxRecords', String(options.maxRecords));
    }
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await airtableFetch(url.toString());
    const payload = (await response.json()) as AirtableListResponse;
    all.push(...(payload.records || []));
    offset = payload.offset;
  } while (offset);

  return all;
}

export async function createRecord(
  tableName: string,
  fields: Record<string, unknown>,
): Promise<AirtableRecord> {
  const response = await airtableFetch(buildTableUrl(tableName), {
    method: 'POST',
    body: JSON.stringify({
      records: [{ fields }],
      typecast: true,
    }),
  });
  const payload = (await response.json()) as AirtableListResponse;
  return payload.records[0];
}

export async function updateRecord(
  tableName: string,
  recordId: string,
  fields: Record<string, unknown>,
): Promise<AirtableRecord> {
  const response = await airtableFetch(buildTableUrl(tableName), {
    method: 'PATCH',
    body: JSON.stringify({
      records: [{ id: recordId, fields }],
      typecast: true,
    }),
  });
  const payload = (await response.json()) as AirtableListResponse;
  return payload.records[0];
}

export async function deleteRecord(tableName: string, recordId: string): Promise<void> {
  const url = new URL(buildTableUrl(tableName));
  url.searchParams.set('records[]', recordId);
  await airtableFetch(url.toString(), { method: 'DELETE' });
}
