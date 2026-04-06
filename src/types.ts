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
}

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'nextMonth' | 'quarter';
