// TEMPORARY: Time-based event filtering logic from Calendar.tsx
import type { Event, FilterType } from '../types';

export function filterEvents(events: Event[], filter: FilterType): Event[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (filter) {
    case 'today':
      return events.filter(event => {
        const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
        return eventDate.getTime() === today.getTime();
      });
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return events.filter(event => {
        const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
        return eventDate >= weekStart && eventDate <= weekEnd;
      });
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return events.filter(event => {
        const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
        return eventDate >= monthStart && eventDate <= monthEnd;
      });
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return events.filter(event => {
        const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
        return eventDate >= quarterStart && eventDate <= quarterEnd;
      });
    case 'all':
    default:
      return events;
  }
}

export function getFilterCount(events: Event[], filter: FilterType): number {
  return filterEvents(events, filter).length;
} 