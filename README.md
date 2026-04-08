# Shared Calendar - Central VA Startup Ecosystem

A shared event calendar for the Central Virginia startup ecosystem (ESOs - Entrepreneurial Support Organizations). View, create, edit, and delete events in both calendar and list views.

## Features

- **Calendar View** — Monthly grid with event visualization and navigation
- **List View** — Filterable event list with time-based filters
- **Event Management** — Full CRUD: create, view, edit, delete events
- **Time Filters** — Today, Week, Month, Next Month, Quarter, All
- **Dark Mode** — Toggle between light and dark themes
- **URL State** — Direct links to events via `?event=<id>` and view switching via `?view=calendar|list`
- **Print** — Print calendar functionality

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **UI** | Radix UI, shadcn/ui, Tailwind CSS |
| **Forms** | react-hook-form |
| **Date Handling** | react-day-picker |
| **Icons** | lucide-react |

## Services & Connections

### Backend: Airtable via API Proxy

The application now uses an **API proxy layer** to connect to **Airtable** securely. Airtable secrets are server-only and never exposed to the browser bundle.

**Frontend service modules:**

- `src/services/eventsApi.ts` — Events CRUD service used by the UI (HTTP to `/api/events`, Airtable-backed)
- `src/siteConfig.ts` — Static footer links and other site copy (no API)

**Proxy/API modules:**

- `api/events.ts` — Airtable-backed events endpoint (`GET/POST/PUT/DELETE`)
- `api/_lib/airtable.ts` — Airtable HTTP helpers, `listRecords` (full scan), `listRecordsPage` (single page + sort)
- `api/_lib/mappers.ts` — Airtable field mapping and normalization

**Data Flow:**

1. App loads events through `getEventsPage()` → same-origin **`GET /api/events`** (paginated); “Load more” passes **`offset`** from the previous response’s **`nextOffset`**.
2. The proxy authenticates to Airtable using `AIRTABLE_PAT` and `AIRTABLE_BASE_ID`.
3. List queries use an Airtable **`filterByFormula`**: **approved** status (including the legacy `apporoved` typo) and **`End Date`** not before **30 days before `TODAY()`** (per the base’s timezone). Rows are sorted by **`Start Date`** ascending. Up to **`limit`** records per request (default **100**, max **100**); **`nextOffset`** is the Airtable pagination cursor or **`null`** when done.
4. **`getEvents()`** in `eventsApi` still exists and **follows every page** until `nextOffset` is null (use for scripts/tests; the UI uses **`getEventsPage`** for lazy loading).

**`GET /api/events` query parameters**

| Parameter | Description |
|-----------|-------------|
| `limit` | Page size (1–100, default 100). |
| `offset` | Opaque cursor from the previous response’s `nextOffset`. |

**Response shape:** `{ "events": [ … ], "nextOffset": "<cursor>" \| null }` (JSON). **`POST` / `PUT` / `DELETE`** responses are unchanged (single event or `{ success: true }`).

**Search / calendar:** Client-side search only matches **events already loaded**; load more pages to widen coverage. The calendar reflects the same loaded set until additional pages are fetched.

**Airtable tables used by runtime:**

- **Events** — `Event ID`, `Status`, `Title`, `Start Date`, `End Date`, `All Day Event`, `Host Group`, `Location`, `Notes`, `Payment Link`, `Image`, `Event URL` (legacy columns such as tags or repeat fields may remain in the base but are not read or written by this app)

## How to Run

### Prerequisites

- Node.js (latest LTS recommended)
- npm or yarn
- Airtable base with the `Events` table and required fields
- Production host that runs **Node** with `npm start` (see below). Static-only hosts cannot serve `/api/events` unless you point `VITE_API_BASE_URL` at a separate API.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shared-calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Copy `env.example` to `.env` and update:
   ```bash
   cp env.example .env
   ```

4. Edit `.env` with your values:
   ```
   AIRTABLE_PAT=pat_xxx
   AIRTABLE_BASE_ID=appsiGlVk94JBwqHG
   VITE_API_BASE_URL=
   ```

5. Ensure your Airtable base has the `Events` table with the mapped fields.

6. Start the development server:
   ```bash
   npm run dev
   ```

   Local development mounts `/api/events` through Vite middleware that calls `api/events.ts`. Keep `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` set in `.env` so local API calls can reach Airtable.

7. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production build (Railway, VPS, etc.)

`vite preview` and plain static file hosts **do not** run the Airtable proxy: `/api/events` would return the SPA’s `index.html` (HTML), which causes `Unexpected token '<'` in the browser. Use the included Node server instead.

1. Set environment variables on the host: **`AIRTABLE_PAT`**, **`AIRTABLE_BASE_ID`**, and optionally **`PORT`** (Railway sets `PORT` automatically).
2. Build and start:
   ```bash
   npm run build
   npm start
   ```
   `npm start` runs `tsx server.ts`, which serves `dist/` and handles **`GET/POST/PUT/DELETE /api/events`**.

`GET /health` returns `200` with body `ok` for readiness checks.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Serve `dist/` + `/api/events` (use in production) |
| `npm run preview` | Preview static build only (no API — not for production data) |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AIRTABLE_PAT` | Airtable Personal Access Token (server-only) |
| `AIRTABLE_BASE_ID` | Airtable base ID (server-only) |
| `VITE_API_BASE_URL` | Optional frontend API base URL override (defaults to same-origin) |
| `PORT` | HTTP port for `npm start` (defaults to `4173`; Railway provides this) |

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Main application
├── types.ts              # TypeScript type definitions
├── siteConfig.ts         # Static footer links / site copy
├── components/
│   ├── Calendar.tsx              # Month calendar grid
│   ├── EventList.tsx             # List view
│   ├── EventListCompact.tsx      # Compact list variant
│   ├── EventModal.tsx            # Create/edit event form
│   ├── FloatingNewEventButton.tsx
│   └── ui/                       # shadcn/ui components
└── services/
    └── eventsApi.ts       # Events service (calls /api/events)

api/
├── events.ts              # Airtable events proxy endpoint
└── _lib/
    ├── airtable.ts        # Airtable HTTP/env helpers
    ├── mappers.ts         # Airtable <-> app mapping logic
    └── nodeHttpAdapter.ts # Node request/response helpers (dev middleware + `server.ts`)

server.ts                  # Production Node entry: static `dist/` + `/api/events`
```

## Data Architecture

### Event Model

Events include: id, title, startDate, endDate, isAllDay, optional link, notes, hostOrganization, location. **User-visible** date and time formatting uses **US Eastern** (`America/New_York`); values are stored and exchanged as ISO-8601 strings. See `src/types.ts` and `src/utils/eventTime.ts`.

### State Management

- Single-page app (no React Router)
- URL parameters for view and event state: `?view=calendar|list`, `?event=<id>`
- React hooks for local state
- `window.history` for back/forward navigation

## Deployment

Deploy on a platform that supports API routes/functions (for the proxy), such as:

- Vercel
- Railway (with server runtime)

Configure `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` in host environment settings. They must be server-only.

## Related Documentation

- [FLATFILE_DB_IDEA.md](FLATFILE_DB_IDEA.md) — Shelved idea for flat-file event storage
- [Attributions.md](Attributions.md) — Component and asset credits
