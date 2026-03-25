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
