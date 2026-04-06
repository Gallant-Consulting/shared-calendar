import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import eventsHandler from './api/events';
import settingsHandler from './api/settings';

const API_ROUTES: Record<string, (request: Request) => Promise<Response>> = {
  '/api/events': eventsHandler,
  '/api/settings': settingsHandler,
};

async function readRawBody(req: IncomingMessage): Promise<Uint8Array | undefined> {
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

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const origin = `http://${req.headers.host || 'localhost:5173'}`;
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
    body,
  });
}

async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const body = new Uint8Array(await response.arrayBuffer());
  res.end(body);
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite normally loads `.env` into `process.env`, but our dev middleware runs in
  // the Vite process and the error suggests the server-side handler isn't seeing it.
  // Explicitly load and copy into `process.env` to make local dev deterministic.
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }

  return {
    plugins: [
      react(),
      {
        name: 'local-api-routes',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const requestUrl = req.url ? new URL(req.url, 'http://localhost').pathname : '';
            const handler = API_ROUTES[requestUrl];
            if (!handler) {
              next();
              return;
            }

            try {
              const request = await toWebRequest(req);
              const response = await handler(request);
              await writeWebResponse(res, response);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Unknown error';
              res.statusCode = 500;
              res.setHeader('content-type', 'text/plain; charset=utf-8');
              res.end(message);
            }
          });
        },
      },
    ],
    test: {
      environment: 'happy-dom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
