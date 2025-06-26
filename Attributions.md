This Figma Make file includes components from [shadcn/ui](https://ui.shadcn.com/) used under [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

This Figma Make file includes photos from [Unsplash](https://unsplash.com) used under [license](https://unsplash.com/license).

## Architectural Decisions

### Event Data Structure (Google Sheets Backend)

| Column Header      | Type      | Description                                                                 |
|--------------------|-----------|-----------------------------------------------------------------------------|
| Status             | string    | (Optional) Approval/moderation status.                                      |
| Tags               | string    | Comma-separated tags (e.g., ESO, Networking).                               |
| GUID               | string    | Unique event identifier (used as `id` in the app).                          |
| Title              | string    | Event title.                                                                |
| startDateTime      | string    | Start date/time (ISO string recommended).                                   |
| endDateTime        | string    | End date/time (ISO string recommended).                                     |
| isAllDay           | boolean   | TRUE/FALSE for all-day events.                                              |
| repeatFrequency    | string    | (Optional) none/daily/weekly/monthly.                                       |
| repeatUntil        | string    | (Optional) End date for repeat (ISO string).                                |
| hostOrganization   | string    | (Optional) Name of host org.                                                |
| isPaid             | boolean   | TRUE/FALSE.                                                                 |
| Cost               | string    | (Optional) Cost of event.                                                   |
| Location           | string    | (Optional) Event location.                                                  |
| Description        | string    | (Optional) Event notes/description.                                         |
| RegistrationUrl    | string    | (Optional) Registration or main event link.                                 |
| ImageUrl           | string    | (Optional) Event image URL.                                                 |
| EventUrl           | string    | (Optional) Public event page URL.                                           |