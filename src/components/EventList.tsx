import { useEffect, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import { ScheduleEventCard } from './ScheduleEventCard';
import type { Event } from '../types';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  onTopVisibleMonthChange?: (month: Date) => void;
  scrollContainerHeight?: string;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function EventList({
  events,
  onEventClick,
  searchQuery,
  onSearchQueryChange,
  hasMore,
  onLoadMore,
  onTopVisibleMonthChange,
  scrollContainerHeight = 'calc(100vh - 220px)',
}: EventListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const monthHeaderRefs = useRef<Record<string, HTMLHeadingElement | null>>({});

  const groupedEvents = useMemo(() => {
    const groups: { key: string; month: Date; items: Event[] }[] = [];
    for (const event of events) {
      const eventMonth = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), 1);
      const key = monthKey(eventMonth);
      const existing = groups.find((group) => group.key === key);
      if (existing) {
        existing.items.push(event);
      } else {
        groups.push({ key, month: eventMonth, items: [event] });
      }
    }
    return groups;
  }, [events]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    if (!onTopVisibleMonthChange || groupedEvents.length === 0) return;
    const root = scrollRootRef.current;
    if (!root) return;

    const detectTopMonth = () => {
      const rootTop = root.getBoundingClientRect().top;
      let nearest: { month: Date; delta: number } | null = null;

      for (const group of groupedEvents) {
        const heading = monthHeaderRefs.current[group.key];
        if (!heading) continue;
        const delta = Math.abs(heading.getBoundingClientRect().top - rootTop);
        if (!nearest || delta < nearest.delta) {
          nearest = { month: group.month, delta };
        }
      }

      if (nearest) {
        onTopVisibleMonthChange(nearest.month);
      }
    };

    detectTopMonth();
    root.addEventListener('scroll', detectTopMonth);
    return () => root.removeEventListener('scroll', detectTopMonth);
  }, [groupedEvents, onTopVisibleMonthChange]);

  const searchHasValue = searchQuery.trim().length > 0;
  const resultLabel = searchHasValue
    ? `${events.length} result${events.length === 1 ? '' : 's'}`
    : `${events.length} upcoming`;

  const monthTitle = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const onInputChange = (value: string) => {
    onSearchQueryChange(value);
  };

  const emptyTitle = searchHasValue ? 'No matching events found' : 'No upcoming events';

  return (
    <div className="w-full">
      <label className="mb-5 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Search for an event"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mb-4 text-sm text-muted-foreground">{resultLabel}</div>

      <div ref={scrollRootRef} className="overflow-y-auto pr-2" style={{ maxHeight: scrollContainerHeight }}>
        {groupedEvents.length > 0 ? (
          <div className="space-y-6">
            {groupedEvents.map((group) => (
              <section key={group.key} data-month-key={group.key}>
                <h3
                  ref={(node) => {
                    monthHeaderRefs.current[group.key] = node;
                  }}
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {monthTitle(group.month)}
                </h3>
                <div className="space-y-4">
                  {group.items.map((event) => (
                    <ScheduleEventCard key={event.id} event={event} onEventClick={onEventClick} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            {emptyTitle}
          </div>
        )}

        {hasMore ? (
          <div className="mt-4 flex flex-col items-center gap-3 pb-2">
            <div ref={sentinelRef} className="h-1 w-full" />
            <button
              type="button"
              onClick={onLoadMore}
              className="rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Load more events
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}