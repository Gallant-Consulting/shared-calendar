import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import eventsHandler from './api/events';
import { incomingMessageToWebRequest, writeWebResponseToNode } from './api/_lib/nodeHttpAdapter';

const API_ROUTES: Record<string, (request: Request) => Promise<Response>> = {
  '/api/events': eventsHandler,
};

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
              const origin = `http://${req.headers.host || 'localhost:5173'}`;
              const request = await incomingMessageToWebRequest(req as IncomingMessage, origin);
              const response = await handler(request);
              await writeWebResponseToNode(res as ServerResponse, response);
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
