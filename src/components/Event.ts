export interface Event {
  /** Unique event identifier (from GUID column) */
  id: string;
  /** Event title */
  title: string;
  /** Start date/time as JS Date object */
  startDate: Date;
  /** End date/time as JS Date object */
  endDate: Date;
  /** TRUE/FALSE for all-day events */
  isAllDay: boolean;
  /** Comma-separated tags (e.g., ESO, Networking) */
  tags?: string[];
  /** (Optional) Approval/moderation status */
  status?: string;
  /** (Optional) Repeat frequency: none/daily/weekly/monthly */
  repeatFrequency?: string;
  /** (Optional) End date for repeat as JS Date object */
  repeatUntil?: Date;
  /** (Optional) Name of host org */
  hostOrganization?: string;
  /** TRUE/FALSE for paid events */
  isPaid?: boolean;
  /** (Optional) Cost of event */
  cost?: string;
  /** (Optional) Event location */
  location?: string;
  /** (Optional) Event notes/description */
  description?: string;
  /** (Optional) Registration or main event link */
  registrationUrl?: string;
  /** (Optional) Event image URL */
  imageUrl?: string;
  /** (Optional) Public event page URL */
  eventUrl?: string;
} 