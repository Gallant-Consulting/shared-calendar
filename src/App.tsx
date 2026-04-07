import './styles/globals.css'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar } from './components/Calendar';
import { EventList } from './components/EventList';
import { EventModal } from './components/EventModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import type { Event } from './types';
import { getEvents, addEvent as apiAddEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent } from './services/eventsApi';
import { eventMatchesQuery } from './utils/eventSearch';
import { FOOTER_LINKS } from './siteConfig';

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // console.error('EventModal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error in EventModal</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>There was an error rendering the EventModal:</p>
              <pre className="text-sm bg-muted p-2 rounded mt-2 overflow-auto">
                {this.state.error?.message}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Keep dark mode behavior but hide the toggle icon.
    // We still follow OS/system preference so dark mode remains usable.
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [activeMonth, setActiveMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [scrollToDay, setScrollToDay] = useState<Date | null>(null);

  // Handle browser back/forward: clear edit modal when `event` query is removed from the URL.
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('event');

      if (!eventId) {
        setIsEventModalOpen(false);
        setEditingEvent(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Apply theme class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Follow system dark mode preference (toggle icon intentionally hidden).
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;

    const handleChange = () => setIsDarkMode(mql.matches);
    handleChange();

    if (mql.addEventListener) mql.addEventListener('change', handleChange);
    else mql.addListener(handleChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handleChange);
      else mql.removeListener(handleChange);
    };
  }, []);

  // Fetch events from API on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    getEvents()
      .then(setEvents)
      .catch(e => {
        setError(e.message || 'Failed to load events');
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const future = events.filter((event) => event.endDate >= todayStart);
    const base = future.length > 0 ? future : events;
    return [...base].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return upcomingEvents;
    return events
      .filter((event) => eventMatchesQuery(event, searchQuery))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events, upcomingEvents, searchQuery]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, events]);

  useEffect(() => {
    if (filteredEvents.length > 0) {
      const first = filteredEvents[0].startDate;
      setActiveMonth(new Date(first.getFullYear(), first.getMonth(), 1));
    }
  }, [filteredEvents]);

  // Must be memoized: a new array every render would retrigger EventList's scroll sync and reset the calendar month.
  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount],
  );
  const hasMore = visibleCount < filteredEvents.length;

  const handleSaveEvent = async (eventData: Omit<Event, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      if (editingEvent) {
        // Update
        const updated = await apiUpdateEvent({ ...eventData, id: editingEvent.id });
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
      } else {
        // Add
        const added = await apiAddEvent(eventData);
        setEvents(prev => [...prev, added]);
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save event';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete event';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('event');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const currentYear = new Date().getFullYear();

  const shouldHideFooterLink = (text: string) => {
    const normalized = text.trim().toLowerCase();
    return (
      normalized === 'terms of service' ||
      normalized === 'privacy policy' ||
      normalized === 'cookie policy' ||
      normalized === 'tos' ||
      normalized === 'privacy' ||
      normalized === 'cookie'
    );
  };

  const visibleFooterLinks = FOOTER_LINKS.filter((link) => !shouldHideFooterLink(link.text));

  const handleLoadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + 20, filteredEvents.length));
  }, [filteredEvents.length]);

  const handleTopVisibleMonthChange = useCallback((month: Date) => {
    setActiveMonth(new Date(month.getFullYear(), month.getMonth(), 1));
  }, []);

  const handleCalendarMonthChange = useCallback((month: Date) => {
    setActiveMonth(new Date(month.getFullYear(), month.getMonth(), 1));
  }, []);

  const handleScrollToDayComplete = useCallback(() => {
    setScrollToDay(null);
  }, []);

  const handleCalendarDayWithEventsClick = (date: Date) => {
    const idx = filteredEvents.findIndex(
      (e) =>
        e.startDate.getFullYear() === date.getFullYear() &&
        e.startDate.getMonth() === date.getMonth() &&
        e.startDate.getDate() === date.getDate(),
    );
    if (idx < 0) return;
    setVisibleCount((c) => Math.max(c, idx + 1));
    setScrollToDay(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground geometric-bg">
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow z-50">
          {error}
        </div>
      )}
      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-8 pb-4">
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-6 pb-2 pt-2">
          <div className="mb-4 shrink-0">
            <h1 className="text-4xl font-semibold tracking-tight">
              Central VA <span className="text-fuchsia-600">Events</span>
            </h1>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-1">
            <div className="flex min-h-0 flex-col justify-start lg:sticky lg:top-4">
              <Calendar
                events={filteredEvents}
                displayMonth={activeMonth}
                onDisplayMonthChange={handleCalendarMonthChange}
                onDayWithEventsClick={handleCalendarDayWithEventsClick}
              />
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden">
              <EventList
                events={visibleEvents}
                accentSourceEvents={filteredEvents}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onTopVisibleMonthChange={handleTopVisibleMonthChange}
                scrollToDay={scrollToDay}
                onScrollToDayComplete={handleScrollToDayComplete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Below main content */}
      <div className="shrink-0 py-4 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Powered by{' '}
              <a href="https://goodfix.tech" className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">Good Fix</a>
              &nbsp;&copy; {currentYear}
              
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {visibleFooterLinks.map((link, index) => (
              <a 
                key={index}
                href={link.url} 
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Event Edit/Create Modal with Error Boundary */}
      <ErrorBoundary>
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseEventModal}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
          initialData={editingEvent}
          selectedDate={selectedDate}
        />
      </ErrorBoundary>
    </div>
  );
}
