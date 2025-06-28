export interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  attendees: { name: string; avatar: string }[];
  link?: string;
  repeat?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    until?: Date;
  };
  notes?: string;
  hostOrganization?: string;
  location?: string;
  tags?: string[];
}

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'nextMonth' | 'quarter';

// Default tag options (fallback if settings not loaded)
export const DEFAULT_TAGS = ['ESO', 'PAID', 'NETWORKING'] as const;
export type Tag = string;

// Available tag options
export const AVAILABLE_TAGS = ['ESO', 'PAID', 'NETWORKING', 'VIRTUAL'] as const;
export const TAG_LABELS: Record<Tag, string> = {
  ESO: 'ESO Hosted',
  PAID: 'Paid',
  NETWORKING: 'Networking',
  VIRTUAL: 'Virtual',
}; 