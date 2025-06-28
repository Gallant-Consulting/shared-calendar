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
  tags?: Tag[];
}

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'quarter';

// Available tag options
export const AVAILABLE_TAGS = ['ESO', 'PAID', 'NETWORKING', 'VIRTUAL'] as const;
export type Tag = typeof AVAILABLE_TAGS[number];
export const TAG_LABELS: Record<Tag, string> = {
  ESO: 'ESO Hosted',
  PAID: 'Paid',
  NETWORKING: 'Networking',
  VIRTUAL: 'Virtual',
}; 