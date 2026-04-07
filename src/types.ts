export interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  link?: string;
  notes?: string;
  hostOrganization?: string;
  location?: string;
  /** Public URL for a flyer/hero image (Airtable attachment or image URL field). */
  imageUrl?: string;
}

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'nextMonth' | 'quarter';
