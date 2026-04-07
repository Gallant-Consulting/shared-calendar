import { useMemo, useState } from 'react';
import { EventList } from './components/EventList';
import type { Event, FilterType } from './types';
import { eventMatchesQuery } from './utils/eventSearch';

export default function EmbedApp() {
  const [events] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filterEvents = (eventList: Event[], filter: FilterType): Event[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return eventList.filter((event) => {
          const eventDate = new Date(
            event.startDate.getFullYear(),
            event.startDate.getMonth(),
            event.startDate.getDate(),
          );
          return eventDate.getTime() === today.getTime();
        });

      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventList.filter((event) => {
          const eventDate = new Date(
            event.startDate.getFullYear(),
            event.startDate.getMonth(),
            event.startDate.getDate(),
          );
          return eventDate >= weekStart && eventDate <= weekEnd;
        });
      }

      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return eventList.filter((event) => {
          const eventDate = new Date(
            event.startDate.getFullYear(),
            event.startDate.getMonth(),
            event.startDate.getDate(),
          );
          return eventDate >= monthStart && eventDate <= monthEnd;
        });
      }

      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return eventList.filter((event) => {
          const eventDate = new Date(
            event.startDate.getFullYear(),
            event.startDate.getMonth(),
            event.startDate.getDate(),
          );
          return eventDate >= quarterStart && eventDate <= quarterEnd;
        });
      }

      case 'all':
      default:
        return eventList;
    }
  };

  const listEvents = useMemo(() => {
    if (searchQuery.trim()) {
      return events
        .filter((event) => eventMatchesQuery(event, searchQuery))
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }
    return filterEvents(events, 'week');
  }, [events, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <EventList
        events={listEvents}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        hasMore={false}
        onLoadMore={() => {}}
      />
    </div>
  );
}
