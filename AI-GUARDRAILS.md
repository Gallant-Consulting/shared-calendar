# AI Guardrails

Stack: **Vite 7 + React 19 + TypeScript**, **Airtable** via server-only HTTP (`api/`), **Vitest**. Production serves static `dist/` plus **`server.ts`** (Node); dev uses Vite middleware for same-origin `/api/*`.

---

## 0. Work Completion Rules (HIGHEST PRIORITY)

### ALWAYS:
- Complete the actual work specified, not a workaround that produces similar signals
- If a task involves fixing/migrating N files, fix/migrate all N files
- If scope is larger than expected, ASK the user before changing approach
- Verify completion by checking the actual goal was met, not just that builds pass

### NEVER:
- Add exceptions/bypasses for things you were asked to fix
- Substitute "build passes" for "work completed"
- Unilaterally reduce scope to "unblock" something faster
- Mark todos as complete when you added workarounds instead of doing the work

### SHORTCUT DETECTION:
If you find yourself doing any of these, STOP and ask the user:
- Adding ESLint/TypeScript exceptions for code you were supposed to migrate
- Disabling rules instead of making code comply with rules
- Skipping files because "there are too many"
- Using phrases like "unblock the build" or "for now" as justification

### WHEN SCOPE IS LARGE:
1. State the full scope clearly: "This requires migrating X files"
2. ASK: "Should I proceed with all X, or would you prefer a different approach?"
3. Do NOT unilaterally decide to shortcut

---

## 1. Secrets & Airtable Access

### ALWAYS:
- Keep **`AIRTABLE_PAT`** and **`AIRTABLE_BASE_ID`** in **server/runtime env only** (Railway, `.env` locally). They must never appear in `import.meta.env` client keys (`VITE_*`) or bundled UI code.
- Talk to Airtable **only** from **`api/_lib/airtable.ts`** (and handlers that use it, e.g. [`api/events.ts`](api/events.ts)).
- Use [`api/_lib/mappers.ts`](api/_lib/mappers.ts) for Airtable field names ↔ app types (`EventPayload`, etc.).

### NEVER:
- Call `api.airtable.com` (or embed PATs) from **`src/`** components or browser-only modules
- Duplicate env validation in multiple places—extend the existing helpers in [`api/_lib/airtable.ts`](api/_lib/airtable.ts) if needed

---

## 2. API Handlers (`api/`)

### ALWAYS:
- Treat **`api/*.ts`** handlers as the **server boundary**: parse `Request` / query params, call Airtable helpers + mappers, return `Response` with correct `Content-Type` (JSON for success bodies).
- Keep **filter formulas**, **pagination**, and **status rules** that belong in one place in the handler (or small exported helpers colocated in `api/`), not scattered in the client.
- Add or extend **`api/*.test.ts`** when changing handler behavior.

### NEVER:
- Import React or browser-only APIs into `api/` handlers
- Assume `vite preview` or a static CDN serves **`/api/*`** in production—production must run **`npm start`** ([`server.ts`](server.ts)) or another host that forwards `/api/events` to the Node handler

---

## 3. Client HTTP & UI (`src/`)

### ALWAYS:
- Use **[`src/services/eventsApi.ts`](src/services/eventsApi.ts)** (and similar `src/services/*`) for **`fetch`** to same-origin **`/api/...`**. Optional **`VITE_API_BASE_URL`** for an explicit API origin.
- Keep UI in **`src/components/`**; shared pure helpers in **`src/utils/`**; shared types in **`src/types.ts`**.
- Prefer **clear DTO ↔ domain mapping** in the service layer (as in `eventsApi`) and defensive checks when responses might be HTML (misconfigured host).

### NEVER:
- Import from **`api/`** inside **`src/`** (handlers are Node/server; the client must use HTTP only)
- Bypass `eventsApi` with ad-hoc `fetch('/api/events')` scattered across components—extend the service instead

---

## 4. Local Dev vs Production

### ALWAYS:
- **Dev:** Vite [`vite.config.ts`](vite.config.ts) middleware proxies selected paths to the same handlers as production; keep **`api/_lib/nodeHttpAdapter.ts`** in sync when changing Node ↔ Web `Request` conversion.
- **Prod:** Document that **`npm run build`** + **`npm start`** runs [`server.ts`](server.ts) so `/api/events` returns JSON, not the SPA shell.

### NEVER:
- Tell operators to use **`vite preview`** as the production server if they need a working events API

---

## 5. Tests, Docs & Decisions

### ALWAYS:
- Run **`npm test`** after meaningful changes; add tests for new API contracts and service behavior.
- For **significant product or architecture changes**, add a short entry to **[`DECISION_LOG.md`](DECISION_LOG.md)** (context, decision, tradeoffs).
- Update **[`README.md`](README.md)** when the public contract changes (e.g. env vars, `GET /api/events` query/response shape).

### NEVER:
- Rely on "the build passed" as the only verification when behavior or contracts changed

---

## 6. Code Style (General)

### ALWAYS:
- Match existing **naming, file layout, and TypeScript strictness** in the touched area.
- Prefer **small, focused diffs**; avoid drive-by refactors unrelated to the task.
- Use **objects / typed options** for functions with several parameters (e.g. pagination `{ limit, offset }`).

### NEVER:
- Introduce one-off patterns that contradict nearby code without a stated reason in `DECISION_LOG.md`
