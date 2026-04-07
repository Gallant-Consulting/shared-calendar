import type { IncomingMessage, ServerResponse } from 'node:http';

/** Read request body for POST/PUT/PATCH (Node IncomingMessage). */
export async function readRawBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return undefined;
  }
  return Buffer.concat(chunks);
}

/** Build a Web API `Request` from Node's `IncomingMessage` (for shared API handlers). */
export async function incomingMessageToWebRequest(req: IncomingMessage, origin: string): Promise<Request> {
  const url = new URL(req.url || '/', origin);
  const body = await readRawBody(req);
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      return;
    }
    headers.set(key, value);
  });
  return new Request(url.toString(), {
    method: req.method || 'GET',
    headers,
    body: body ?? undefined,
  });
}

/** Write a Web API `Response` to Node's `ServerResponse`. */
export async function writeWebResponseToNode(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body);
}
