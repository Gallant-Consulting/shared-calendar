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

### Backend: NocodeAPI + Google Sheets

The application uses **NocodeAPI** as middleware to connect to **Google Sheets** as the data backend and admin panel. There is no custom backend server.

**API Services:**

- `src/services/googleSheetApi.ts` — Events CRUD (get, add, update, delete)
- `src/services/settingsApi.ts` — Site settings management

**Data Flow:**

1. App fetches events and settings from API services on mount
2. Services make REST calls to the NocodeAPI endpoint
3. NocodeAPI reads/writes to the linked Google Sheet
4. Only events with `status === 'approved'` are displayed
5. If the API is unavailable, sample data is used as fallback (for now)

**Google Sheets Structure:**

- **Event_Data** sheet — Columns: status, tags, id, title, startDate, endDate, isAllDay, repeat, repeatUntil, hostOrganization, isPaid, cost, location, notes, link, image, eventUrl
- **settings** sheet — Key/value pairs: site_title, site_description, contact_email, tags, tag_labels, footer_links

## How to Run

### Prerequisites

- Node.js (latest LTS recommended)
- npm or yarn
- NocodeAPI account ([nocodeapi.com](https://nocodeapi.com))
- Google Sheet with the required structure

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
   VITE_NOCODE_API_ENDPOINT=https://v1.nocodeapi.com/YOUR_USER/YOUR_API/SHEET_ID
   VITE_ADMIN_PASSWORD=your-secure-password
   ```

5. Set up your Google Sheet with `Event_Data` and `settings` tabs, and connect it via NocodeAPI.

6. Start the development server:
   ```bash
   npm run dev
   ```

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
| `VITE_NOCODE_API_ENDPOINT` | NocodeAPI endpoint URL for your Google Sheets integration |
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
    ├── googleSheetApi.ts  # Events API
    └── settingsApi.ts     # Settings API
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

The app builds to static files and can be hosted on:

- Vercel (probably this one)
- Railway

Configure `VITE_NOCODE_API_ENDPOINT` and `VITE_ADMIN_PASSWORD` in your hosting platform's environment settings. The NocodeAPI endpoint must be reachable from the deployed site.

## Related Documentation

- [FLATFILE_DB_IDEA.md](FLATFILE_DB_IDEA.md) — Shelved idea for flat-file event storage
- [Attributions.md](Attributions.md) — Component and asset credits
