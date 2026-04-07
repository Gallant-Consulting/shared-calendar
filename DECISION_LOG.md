# Decision Log

## 2026-04-06 - Calendar day dots match schedule accent colors

### Context
Month cells used a single fuchsia dot for “has events,” while list cards used a rotating pink / amber / cyan accent tied to position in the grouped schedule.

### Decision
- Add `getScheduleAccentColor` in `src/utils/scheduleAccent.ts` using the same month-group + insertion order as `EventList`.
- Pass `accentSourceEvents={filteredEvents}` into `EventList` so card colors stay aligned with the full filtered set when the list is paginated (“load more”).
- Render one dot per event on a day (same colors as the cards); multiple events stack as small dots in a row.

## 2026-04-06 - Remove event details modal

### Context
Schedule list cards were wrapped in a click handler that opened `EventDetailsModal`, so clicks on non-link areas (including the “Hosted by …” line) triggered the modal. Event content is already visible on the card, and the title can link out when `event.link` is set.

### Decision
- Remove `EventDetailsModal` and all wiring (`onEventClick` on `EventList` / `ScheduleEventCard`, `?event=` deep-link behavior that opened the details modal, related `App` / `EmbedApp` state).
- Cards are no longer globally clickable; interactive elements remain the optional title link, map link for address-like locations, and images.

### Tradeoffs
- No full-screen detail view; users rely on the card body and external links.
- Bookmarks with `?event=` no longer open a modal (URL cleanup on navigation was tied to that flow).

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

## 2026-04-06 - Airtable-only event model, naming cleanup, Eastern time display

### Context
The codebase still referenced Google Sheets naming for the events HTTP client, and the product model included attendees, tags, and recurrence that are no longer part of the Airtable-backed workflow. Settings still exposed tag lists used only for event tagging.

### Decision
- Rename the frontend events module to `src/services/eventsApi.ts` (same `/api/events` contract).
- Remove **attendees**, **tags**, and **recurrence** from the `Event` type, API `EventPayload`, mappers, UI (modals, cards, list compact), and search haystack.
- Remove **tags** and **tag_labels** from the settings shape and API mapping; stop reading them into the frontend and stop writing them from `PUT /api/settings` (legacy Airtable columns may remain).
- Standardize **user-visible** event date/time formatting on **US Eastern** (`America/New_York`) via `src/utils/eventTime.ts`; interpret Airtable **date-only** `Start Date` / `End Date` values as **midnight that calendar day in Eastern** when mapping to ISO in `api/_lib/mappers.ts`.

### Rationale
- Aligns naming and data model with an Airtable-only backend and reduces unused surface area.
- One display timezone avoids ambiguous local browser formatting for a region-specific calendar.
- Slimmer settings and event payloads simplify maintenance and tests.

### Tradeoffs
- Existing Airtable tag/recurrence columns are no longer surfaced; manual base cleanup is optional.
- Calendar grid month/day bucketing still uses the browser’s local date for cell keys (unchanged); list and modal formatting use Eastern as documented.

## 2026-04-06 - Remove Airtable-backed app settings

### Context
Site settings were loaded from `GET /api/settings` (Airtable `app_settings`). On static or misconfigured hosts the route returned HTML (SPA fallback), triggering non-JSON warnings. Product need for remote-editable settings was minimal.

### Decision
- Remove `api/settings.ts`, the `/api/settings` dev route, `src/services/settingsApi.ts`, and the unused `SettingsModal` UI.
- Keep footer links and related copy in `src/siteConfig.ts` as static exports.

### Rationale
- Eliminates a failing network path and deployment coupling for data we do not need to store in Airtable.
- Fewer env vars and less server surface area.

### Tradeoffs
- Changing footer links or marketing copy requires a code change instead of an Airtable row.

## 2026-04-06 - Event list: vertical Embla carousel and main/footer flex layout

### Context
Scroll-snap and overflow on the event column still clipped cards and a `100vh`-based column height let the page grow below the footer.

### Decision
- Render visible events in `EventList` with shadcn/Embla `Carousel` (`orientation="vertical"`), one slide per event; month headings on first event of each month; sync calendar month from Embla `select`; `scrollToDay` uses `api.scrollTo(index)`; optional load-more when the user reaches the last slide (guarded so single-slide lists do not auto-fetch on mount); manual “Load more” and IntersectionObserver sentinel retained.
- Extend `carousel.tsx` with vertical viewport height (`h-full min-h-0`), column inner `h-full`, ArrowUp/ArrowDown keyboard handling, and `min-h-0` on vertical items.
- Structure the app shell as `min-h-screen flex flex-col` with a `flex-1 min-h-0` main region and `shrink-0` footer; size the event column with grid stretch and `min-h-*` floors instead of `calc(100vh - …)` alone.

### Rationale
- Embla gives stable snap-to-slide behavior and avoids layout overflow quirks from nested scroll areas.
- Flex layout allocates remaining height between header and footer so the document does not extend past the footer when the list is tall.

### Tradeoffs
- Very tall cards are clipped per slide (`overflow-hidden`) so vertical gestures go to Embla; users move between events via swipe, keyboard, or the on-card nav buttons.

### Follow-up (same day)
- Embla’s default `containScroll: 'trimSnaps'` can collapse to **one scroll snap** when total slide height fits in the viewport (`contentSize <= viewSize`), which made **only the first event reachable**. Set **`containScroll: false`** so each slide keeps its own snap, and use **stable keys** `id + index` in case duplicate `Event ID` values exist in source data. Added **Previous/Next** controls and `touch-pan-y` on the track; removed nested `overflow-y-auto` on slides so vertical drags reach Embla.

### Follow-up — revert to plain scroll list
- **Removed** the vertical Embla carousel from `EventList` in favor of a **plain `overflow-y-auto` list** (month groups, scroll-linked calendar month, day anchors, load-more). Variable-height cards and scroll/wheel interaction behaved poorly with Embla for this UI.
- The scroll region uses **`border-b border-border`** so the bottom edge of the clipping area is visible without wrapping the whole column in a box border.

## 2026-04-06 - Schedule list card layout and optional hero image

### Context
List cards used a three-dot menu, left-aligned time/date, and small title. We wanted alignment closer to a reference: title + optional host on the left, date and time stacked on the right, optional image under the title, title linking to the public event URL.

### Decision
- **`ScheduleEventCard`**: Remove the overflow menu; top row is **title** (link to `event.link` when present, larger type) + optional **Hosted by** line on the left; **day number**, **month**, and **time** (`ALL DAY` or Eastern range) on the right; **notes** below; **rounded image** below the title when `event.imageUrl` is set; footer row is **location** only (map link when address-like).
- **`Event.imageUrl`**: Mapped in `api/_lib/mappers` from Airtable **`Image URL`** (plain https URL), then **`Image`**, **`Flyer`**, and **`Cover Image`**, each of which may be either a **plain https URL string** (e.g. long text / URL field) or the **first attachment** in Airtable’s attachment shape.

### Tradeoffs
- Event URL is both the card title link and the prior “open external” menu action; there is no in-card “copy link” from the menu anymore (users can copy from the browser).
