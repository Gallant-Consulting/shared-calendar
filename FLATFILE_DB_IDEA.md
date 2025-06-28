# Flat File as Event Database: Idea (Shelved)

## Overview
Consider using a flat file (e.g., `events.json`) as a simple, public database for event details. The app would read from this file, and the file would be updated only when events are approved, updated, or removed. The spreadsheet remains the control panel for event management.

---

## Workflow
- **Spreadsheet** is the source of truth and control panel (edited by a few trusted users).
- **Flat file** (`events.json`) is generated from the spreadsheet and contains only approved events.
- **App** fetches `events.json` for fast, CDN-cached reads (no API call on every page load).
- **Updates** to the flat file occur:
  - When an event is approved, updated, or removed (status changed from approved, deleted, etc.).
  - After a periodic scrape or manual update of the spreadsheet (a few times a week).

---

## Pros
- **Performance:** Fast, static reads for all users.
- **Simplicity:** No backend or database required for reads.
- **Reliability:** No API rate limits or downtime for end users.
- **Cost:** Lower/no API costs for reads.
- **Control:** Only spreadsheet editors can change data; public can only read.
- **Eventual Consistency:** Acceptable for this use case.

## Cons
- **Manual/Automated Update Needed:** Flat file must be updated when events change.
- **No Real-Time Writes:** Cannot update the file from client-side JS in static hosting; requires backend, serverless, or cloud storage API for dynamic updates.
- **Concurrency:** Not suitable for high-frequency writes or many editors.
- **Stale Data:** Data can be out of date between updates.

---

## Update Strategies
- **Manual:** Regenerate and upload/commit the flat file after spreadsheet changes.
- **Automated:** Use a script, webhook, or CI/CD pipeline to update the flat file when the spreadsheet changes.
- **Backend/Cloud Storage:** Use a backend or cloud storage API to allow programmatic updates without redeploying (not implemented yet).

---

## Hosting Considerations
- **Static Hosting:** Place `events.json` in the `public/` directory for static/CDN serving. Requires redeploy or upload to update.
- **Backend/Serverless:** Can update the file dynamically, but adds complexity.
- **Cloud Storage:** Use S3, Firebase, etc. for direct file updates via API.

---

## Status
**This idea is shelved for now, but documented for future reference.** 