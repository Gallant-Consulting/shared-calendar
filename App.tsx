import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { FloatingNewEventButton } from './components/FloatingNewEventButton';
import { EventModal } from './components/EventModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Moon, Sun, MoreHorizontal, Info, Settings, Download, Printer, HelpCircle, ExternalLink } from 'lucide-react';
import { getEvents, addEvent, updateEvent, deleteEvent } from './services/googleSheetApi';
import { Event } from './components/Event';

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'quarter';

export const AVAILABLE_TAGS = ['ESO', 'PAID', 'NETWORKING'] as const;

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EventModal Error:', error, errorInfo);
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [rowIds, setRowIds] = useState<number[]>([]); // Parallel array to events
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('week');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getEvents()
      .then(({ events, rowIds }) => {
        setEvents(events);
        setRowIds(rowIds);
        setIsLoading(false);
      })
      .catch((err) => {
        setError('Failed to load events.');
        setIsLoading(false);
      });
  }, []);

  const filterEvents = (events: Event[], filter: FilterType): Event[] => {
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
  };

  const filteredEvents = filterEvents(events, currentFilter);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNewEvent = (date?: Date) => {
    setSelectedDate(date || null);
    setEditingEvent(null);
    setEditingRowId(null);
    setIsEventModalOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleEditEventFromDetails = () => {
    if (viewingEvent) {
      setEditingEvent(viewingEvent);
      const idx = events.findIndex(e => e.id === viewingEvent.id);
      setEditingRowId(idx !== -1 ? rowIds[idx] : null);
      setIsEventDetailsOpen(false);
      setIsEventModalOpen(true);
    }
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (editingEvent && editingRowId !== null) {
        // Update existing event
        const updatedEvent: Event = { ...eventData, id: editingEvent.id };
        await updateEvent(editingRowId, updatedEvent);
      } else {
        // Add new event
        const newEvent: Event = { ...eventData, id: Date.now().toString() };
        await addEvent(newEvent);
      }
      // Refresh events
      const { events, rowIds } = await getEvents();
      setEvents(events);
      setRowIds(rowIds);
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setEditingRowId(null);
      setSelectedDate(null);
    } catch (err) {
      setError('Failed to save event.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        await deleteEvent(rowIds[idx]);
        const { events: newEvents, rowIds: newRowIds } = await getEvents();
        setEvents(newEvents);
        setRowIds(newRowIds);
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setEditingRowId(null);
    } catch (err) {
      setError('Failed to delete event.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setViewingEvent(null);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setEditingRowId(null);
    setSelectedDate(null);
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  const handleExportCalendar = () => {
    // Placeholder for calendar export functionality
    console.log('Export calendar clicked');
  };

  const handlePrintCalendar = () => {
    // Placeholder for print functionality
    window.print();
  };

  const handleOpenSettings = () => {
    // Placeholder for settings functionality
    console.log('Settings clicked');
  };

  const handleOpenHelp = () => {
    // Placeholder for help functionality
    console.log('Help clicked');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground geometric-bg">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="p-6 bg-white rounded shadow text-lg">Loading events...</div>
        </div>
      )}
      {/* Error message */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow z-50">
          {error}
        </div>
      )}
      {/* Main Title Section - Above main content */}
      <div className="py-16 text-center">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-4xl font-medium">Central VA Startup Ecosystem</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsInfoModalOpen(true)}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <Info className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {/* Calendar Content */}
      <div className="flex justify-center px-6 pb-8">
        <div className="w-full max-w-5xl p-10 rounded-lg border border-border bg-card/95 backdrop-blur-sm">
          {/* Header within container - simplified */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <FloatingNewEventButton onClick={() => handleNewEvent()} />
            </div>
            <div className="text-center">
              <a 
                href="#" 
                className="text-blue-400 hover:text-blue-300 underline text-sm"
              >
                Add this schedule to HEY Calendar, Google Calendar, Outlook, or iCal...
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleOpenSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportCalendar}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrintCalendar}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Calendar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleOpenHelp}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsInfoModalOpen(true)}>
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on GitHub
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Calendar */}
          <Calendar 
            events={filteredEvents}
            allEvents={events}
            onDateSelect={handleDateSelect}
            onEventClick={handleViewEvent}
            onNewEventClick={handleNewEvent}
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
      {/* Footer Section - Below main content */}
      <div className="py-8 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>&copy; {currentYear} Central VA Startup Ecosystem. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
      {/* Info Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={handleCloseInfoModal}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">About This Calendar</DialogTitle>
            <DialogDescription className="sr-only">
              Information about the Central VA Startup Ecosystem calendar
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              A shared calendar for ESO practitioners.
            </p>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleCloseInfoModal}
              className="px-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isEventDetailsOpen}
        onClose={handleCloseEventDetails}
        onEdit={handleEditEventFromDetails}
        event={viewingEvent}
      />
      {/* Event Edit/Create Modal with Error Boundary */}
      <ErrorBoundary>
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseEventModal}
          onSave={handleSaveEvent}
          onDelete={editingEvent && editingRowId !== null ? () => handleDeleteEvent(editingEvent.id) : undefined}
          initialData={editingEvent}
          selectedDate={selectedDate}
        />
      </ErrorBoundary>
    </div>
  );
}