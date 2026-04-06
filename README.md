# Shared Calendar - Central VA Startup Ecosystem

A shared event calendar for the Central Virginia startup ecosystem (ESOs - Entrepreneurial Support Organizations). View, create, edit, and delete events in both calendar and list views.

## Features

- **Calendar View** — Monthly grid with event visualization and navigation
- **List View** — Filterable event list with time-based filters
- **Event Management** — Full CRUD: create, view, edit, delete events
- **Tag System** — Categorize events with ESO, PAID, NETWORKING, VIRTUAL tags
- **Time Filters** — Today, Week, Month, Next Month, Quarter, All
- **Dark Mode** — Toggle between light and dark themes
- **URL State** — Direct links to events via `?event=<id>` and view switching via `?view=calendar|list`
- **Admin Settings** — Password-protected settings for site title, description, tags, footer links
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

- `src/services/googleSheetApi.ts` — Events CRUD service contract used by UI (internals now call `/api/events`)
- `src/services/settingsApi.ts` — Settings service contract used by UI (internals now call `/api/settings`)

**Proxy/API modules:**

- `api/events.ts` — Airtable-backed events endpoint (`GET/POST/PUT/DELETE`)
- `api/settings.ts` — Airtable-backed settings endpoint (`GET/PUT`)
- `api/_lib/airtable.ts` — Airtable HTTP helpers + env validation
- `api/_lib/mappers.ts` — Airtable field mapping and normalization

**Data Flow:**

1. App fetches events and settings through frontend service modules.
2. Services call same-origin proxy routes (`/api/events`, `/api/settings`).
3. Proxy authenticates to Airtable using `AIRTABLE_PAT` and `AIRTABLE_BASE_ID`.
4. Events are mapped from Airtable `Events` table and filtered to approved statuses.
5. Settings are mapped from Airtable `app_settings` table.

**Airtable tables used by runtime:**

- **Events** — `Event ID`, `Status`, `Title`, `Start Date`, `End Date`, `Tags`, `All Day Event`, `Repeat Frequency`, `Repeat Until`, `Host Group`, `Is Paid`, `Cost`, `Location`, `Notes`, `Payment Link`, `Image`, `Event URL`
- **app_settings** — `site_title`, `site_description`, `contact_email`, `tags`, `tag_labels`

## How to Run

### Prerequisites

- Node.js (latest LTS recommended)
- npm or yarn
- Airtable base with required tables/fields
- Deployment target that supports API routes/serverless functions

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
   VITE_ADMIN_PASSWORD=your-secure-password
   ```

5. Ensure your Airtable base has `Events` and `app_settings` tables with the mapped fields.

6. Start the development server:
   ```bash
   npm run dev
   ```

   Local development now mounts `/api/events` and `/api/settings` through Vite middleware that calls the existing handlers in `api/`. Keep `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` set in `.env` so these local API calls can read/write Airtable.

7. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AIRTABLE_PAT` | Airtable Personal Access Token (server-only) |
| `AIRTABLE_BASE_ID` | Airtable base ID (server-only) |
| `VITE_API_BASE_URL` | Optional frontend API base URL override (defaults to same-origin) |
| `VITE_ADMIN_PASSWORD` | Password required to access the Settings modal |

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Main application
├── types.ts              # TypeScript type definitions
├── components/
│   ├── Calendar.tsx              # Month calendar grid
│   ├── EventList.tsx             # List view
│   ├── EventListCompact.tsx      # Compact list variant
│   ├── EventModal.tsx            # Create/edit event form
│   ├── EventDetailsModal.tsx     # View event details
│   ├── SettingsModal.tsx         # Admin settings
│   ├── FloatingNewEventButton.tsx
│   └── ui/                       # shadcn/ui components
└── services/
    ├── googleSheetApi.ts  # Events service (calls /api/events)
    └── settingsApi.ts     # Settings service (calls /api/settings)

api/
├── events.ts              # Airtable events proxy endpoint
├── settings.ts            # Airtable settings proxy endpoint
└── _lib/
    ├── airtable.ts        # Airtable HTTP/env helpers
    └── mappers.ts         # Airtable <-> app mapping logic
```

## Data Architecture

### Event Model

Events include: id, title, startDate, endDate, isAllDay, attendees, link, repeat pattern, notes, hostOrganization, location, tags. See `src/types.ts` for the full interface.

### State Management

- Single-page app (no React Router)
- URL parameters for view and event state: `?view=calendar|list`, `?event=<id>`
- React hooks for local state
- `window.history` for back/forward navigation

## Deployment

Deploy on a platform that supports API routes/functions (for the proxy), such as:

- Vercel
- Railway (with server runtime)

Configure `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, and `VITE_ADMIN_PASSWORD` in host environment settings. `AIRTABLE_PAT` and `AIRTABLE_BASE_ID` must be server-only.

## Related Documentation

- [FLATFILE_DB_IDEA.md](FLATFILE_DB_IDEA.md) — Shelved idea for flat-file event storage
- [Attributions.md](Attributions.md) — Component and asset credits
