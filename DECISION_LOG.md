# Decision Log

## 2026-03-19 - Default Calendar To Current Date And Remove Seed Data

### Context
The calendar UI loaded to a hardcoded month (`June 2025`), which made first render inconsistent with user expectations for a live calendar. The app and embed entry points also contained 2025 sample events used as a fallback/seed path.

### Decision
- Initialize calendar month state from `today` at runtime (first day of the current month).
- Remove sample event generators and seeded sample-event initialization from both main and embed app flows.
- On API load failure in the main app, default to an empty event list instead of injecting demo data.

### Rationale
- Aligns initial load with real-time usage expectations.
- Prevents stale demo data from driving visible behavior.
- Keeps existing event/filter code paths intact while simplifying startup state.

### Tradeoffs
- Empty state is now visible when data loading fails or no events exist.
- No built-in demo content for local showcases unless data is provided via API/source.

## 2026-03-20 - Event List As Horizontal Carousel

### Context
The list view showed events in a vertical stack. We wanted to explore a schedule-style layout closer to a horizontal carousel with a “Schedule — {date}” header and card slides.

### Decision
- Replace the vertical event list in `EventList` with a shadcn/embla `Carousel`: one slide per event, responsive `basis` widths for roughly one to three visible cards.
- Add a header row with title **Schedule**, subtitle **— {month day}** from the **first sorted visible event** after existing date/time sorting.
- Extract slide UI into `ScheduleEventCard` (left tag accent, time row, title, notes, footer with location or avatars, overflow menu for view link / copy link / external link).

### Rationale
- Reuses existing `src/components/ui/carousel.tsx` and keeps filter/tag behavior unchanged.
- Header date matches the primary (first) item in the ordered list, consistent with user expectation for “current schedule” context.

### Tradeoffs
- Compact cards omit some fields from the old list (e.g. host org, inline tags); users can open details from the card or menu.
- Carousel navigation is less familiar than a full vertical list for very long schedules; can revisit with a layout toggle if needed.

## 2026-03-20 - Migrate Data Layer To Airtable Proxy

### Context
The app previously relied on NoCodeAPI + Google Sheets for event and settings persistence. We needed a more robust API model and better secret handling while preserving existing UI behavior and service call sites.

### Decision
- Replace NoCodeAPI/Google Sheets integration with Airtable-backed proxy routes (`/api/events`, `/api/settings`).
- Keep frontend service contracts stable (`getEvents`, `addEvent`, `updateEvent`, `deleteEvent`, `getSettings`, `updateSettings`) and swap internals to proxy calls.
- Add server-side Airtable mapping and environment validation (`AIRTABLE_PAT`, `AIRTABLE_BASE_ID`) with no client-side token usage.

### Rationale
- Improves security by keeping Airtable credentials server-only.
- Improves maintainability by centralizing mapping/normalization in proxy helpers.
- Minimizes UI refactor risk by preserving existing service interfaces used in `App`.

### Tradeoffs
- Introduces backend/runtime dependency for API routes in deployment.
- Adds schema mapping logic that must stay aligned with Airtable table/field definitions.

## 2026-03-30 - Local Dev API Routing Through Vite Middleware

### Context
Local `npm run dev` sessions were sometimes receiving HTML/JS content for `/api/settings` instead of JSON, causing frontend parse failures (`Unexpected token ... is not valid JSON`) and fallback defaults even though the Airtable-backed settings handler already existed.

### Decision
- Route local `/api/events` and `/api/settings` through Vite dev middleware to invoke existing API handlers in `api/events.ts` and `api/settings.ts`.
- Keep frontend service paths unchanged (`/api/*`) for parity with deployed environments.
- Add a defensive JSON content-type check in `src/services/settingsApi.ts` before parsing response bodies.

### Rationale
- Fixes the root cause (wrong local route target) instead of hiding it with client-only workarounds.
- Preserves existing server-side Airtable integration and avoids duplicate local data paths.
- Improves diagnostics when API responses are malformed or misrouted.

### Tradeoffs
- Adds dev-server middleware complexity in `vite.config.ts`.
- Local API behavior now depends on server-side environment variables (`AIRTABLE_PAT`, `AIRTABLE_BASE_ID`) during frontend development.

## 2026-04-06 - Simplified Events Split Layout (UI-Only)

### Context
The events experience needed to align with a simpler visual direction: one month calendar on the left, searchable upcoming events on the right, and continuous scrolling through event cards with month context that tracks the list position. The requested scope explicitly excluded backend/data-contract changes.

### Decision
- Refactor the main UI to a fixed two-column layout:
  - left: single controlled month calendar
  - right: search input + vertically scrolling event card list
- Replace carousel-style list interactions with an infinite reveal list driven by frontend state (`visibleCount`) and `IntersectionObserver` sentinel behavior.
- Keep event sourcing and CRUD paths unchanged (`getEvents`, `addEvent`, `updateEvent`, `deleteEvent`), and implement search filtering client-side only.
- Synchronize the left calendar month with the right list’s top visible month while preserving manual month navigation controls.

### Rationale
- Matches the new screenshot-inspired UX without introducing backend risk.
- Reuses existing component paths (`Calendar`, `EventList`, `ScheduleEventCard`) rather than introducing parallel/redundant screens.
- Maintains existing modal and event-detail flows while simplifying browse/search behavior.

### Tradeoffs
- Infinite reveal still relies on all events already loaded in the client; very large datasets may eventually require virtualization.
- Search is currently in-memory and scoped to loaded event fields, not server-backed relevance.
- Month synchronization is DOM-position based, which is intentionally lightweight but may need refinement for highly dynamic card heights.

## 2026-04-06 - Client-Side Token Search Over Loaded Events

### Context
Search filtered only the upcoming subset with a single substring over a few fields, so users could not find past events or match multiple keywords reliably.

### Decision
- Add [`src/utils/eventSearch.ts`](src/utils/eventSearch.ts) with normalized text, whitespace-separated query tokens, a combined haystack per event (title, notes, location, host organization, link, tags, attendee names, and human-readable start/end date strings), and **AND** semantics (every token must appear as a substring).
- When the search box is **empty**, keep the existing **upcoming-only** list (including the fallback when nothing is upcoming).
- When the query is **non-empty**, search **all events** returned from the API, sorted by `startDate` ascending.

### Rationale
- No backend or third-party search services; behavior is predictable and unit-testable.
- Past events become discoverable when actively searching, without changing the default browse experience.

### Tradeoffs
- Ranking is chronological only, not relevance-ranked.
- Performance depends on in-memory list size; acceptable for typical calendar loads.
