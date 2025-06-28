import './styles/globals.css'
import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { FloatingNewEventButton } from './components/FloatingNewEventButton';
import { EventModal } from './components/EventModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Moon, Sun, MoreHorizontal, Info, Settings, Download, Printer, HelpCircle, ExternalLink } from 'lucide-react';
import type { Event, FilterType } from './types';
import { AVAILABLE_TAGS } from './types';
import { getEvents, addEvent as apiAddEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent } from './services/googleSheetApi';

// Sample events for demonstration
const generateSampleEvents = (): Event[] => [
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Team Standup',
    startDate: new Date(2025, 5, 26, 9, 0), // June 26, 2025 at 9:00 AM
    endDate: new Date(2025, 5, 26, 9, 30), // June 26, 2025 at 9:30 AM
    isAllDay: false,
    attendees: [
      { name: 'Sarah Johnson', avatar: '' },
      { name: 'Mike Chen', avatar: '' },
      { name: 'Alex Rivera', avatar: '' }
    ],
    link: 'https://meet.google.com/abc-defg-hij',
    repeat: {
      frequency: 'weekly',
      until: new Date(2025, 8, 30)
    },
    notes: 'Weekly team standup to discuss progress and blockers',
    hostOrganization: 'Tech Startup Co.',
    location: 'Conference Room A',
    tags: ['ESO']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Product Launch',
    startDate: new Date(2025, 5, 28, 14, 0), // June 28, 2025 at 2:00 PM
    endDate: new Date(2025, 5, 28, 16, 0), // June 28, 2025 at 4:00 PM
    isAllDay: false,
    attendees: [
      { name: 'Emma Davis', avatar: '' },
      { name: 'David Wilson', avatar: '' },
      { name: 'Lisa Park', avatar: '' },
      { name: 'Tom Anderson', avatar: '' }
    ],
    link: 'https://company.zoom.us/j/123456789',
    notes: 'Official launch event for our new product line. Press release goes live at 2 PM.',
    hostOrganization: 'Innovation Labs',
    location: 'Main Auditorium',
    tags: ['PAID']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Conference Day',
    startDate: new Date(2025, 6, 2, 0, 0), // July 2, 2025 - All day
    endDate: new Date(2025, 6, 2, 23, 59), // July 2, 2025 - All day
    isAllDay: true,
    attendees: [
      { name: 'Jennifer Kim', avatar: '' },
      { name: 'Robert Martinez', avatar: '' }
    ],
    link: 'https://techconf2025.com',
    notes: 'Annual tech conference - keynote at 9 AM, workshops throughout the day',
    hostOrganization: 'Central VA Tech Alliance',
    location: 'Richmond Convention Center',
    tags: ['ESO', 'PAID', 'NETWORKING']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: 'Morning Coffee Chat',
    startDate: new Date(2025, 6, 2, 8, 0), // July 2, 2025 at 8:00 AM
    endDate: new Date(2025, 6, 2, 8, 45), // July 2, 2025 at 8:45 AM
    isAllDay: false,
    attendees: [
      { name: 'Marcus Thompson', avatar: '' },
      { name: 'Diana Chen', avatar: '' }
    ],
    notes: 'Casual networking over coffee before the conference begins',
    hostOrganization: 'Startup Network RVA',
    location: 'Hotel Lobby Café',
    tags: ['NETWORKING']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'Evening Networking Reception',
    startDate: new Date(2025, 6, 2, 18, 30), // July 2, 2025 at 6:30 PM
    endDate: new Date(2025, 6, 2, 20, 0), // July 2, 2025 at 8:00 PM
    isAllDay: false,
    attendees: [
      { name: 'Carlos Rodriguez', avatar: '' },
      { name: 'Anna Kowalski', avatar: '' },
      { name: 'James Wright', avatar: '' },
      { name: 'Priya Sharma', avatar: '' },
      { name: 'Michael O\'Connor', avatar: '' }
    ],
    link: 'https://eventbrite.com/networking-reception',
    notes: 'Post-conference networking with light refreshments and drinks. Great opportunity to connect with fellow attendees.',
    hostOrganization: 'Business Innovation Hub',
    location: 'Sky Bar Rooftop',
    tags: ['NETWORKING', 'PAID']
  }
];

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');

  // URL parameter handling for direct event links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    
    if (eventId) {
      // Store the event ID to check once events are loaded
      const checkEventOnceLoaded = () => {
        if (events.length > 0) {
          const event = events.find(e => e.id === eventId);
          if (event) {
            setViewingEvent(event);
            setIsEventDetailsOpen(true);
            // Update URL without triggering a page reload
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('event', eventId);
            window.history.replaceState({}, '', newUrl.toString());
          }
        }
      };
      
      // Check immediately if events are already loaded
      checkEventOnceLoaded();
      
      // Also set up a listener for when events change
      const interval = setInterval(checkEventOnceLoaded, 100);
      
      // Clean up interval after 5 seconds or when events are found
      setTimeout(() => clearInterval(interval), 5000);
      
      return () => clearInterval(interval);
    }
  }, [events]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('event');
      
      if (eventId && events.length > 0) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          setViewingEvent(event);
          setIsEventDetailsOpen(true);
        }
      } else {
        // No event parameter, close modals
        setIsEventDetailsOpen(false);
        setIsEventModalOpen(false);
        setViewingEvent(null);
        setEditingEvent(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [events]);

  useEffect(() => {
    // Apply theme class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch events from API on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    getEvents()
      .then(setEvents)
      .catch(e => {
        setError(e.message || 'Failed to load events');
        // Fallback to sample events if API fails
        setEvents(generateSampleEvents());
      })
      .finally(() => setLoading(false));
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
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
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
    // Just update the selected date - don't open modal
    setSelectedDate(date);
  };

  const handleNewEvent = (date?: Date) => {
    // console.log('handleNewEvent called with:', date);
    // console.log('About to set modal state...');
    
    try {
      setSelectedDate(date || null);
      setEditingEvent(null);
      setIsEventModalOpen(true);
      // console.log('Modal state set successfully');
    } catch (error) {
      // console.error('Error in handleNewEvent:', error);
    }
  };

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
    setIsEventDetailsOpen(true);
    // Update URL with event parameter
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('event', event.id);
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleEditEventFromDetails = () => {
    if (viewingEvent) {
      setEditingEvent(viewingEvent);
      setIsEventDetailsOpen(false);
      setIsEventModalOpen(true);
      // Remove event parameter from URL since we're switching to edit mode
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('event');
      window.history.replaceState({}, '', newUrl.toString());
    }
  };

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
    } catch (e: any) {
      setError(e.message || 'Failed to save event');
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
    } catch (e: any) {
      setError(e.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setViewingEvent(null);
    // Remove event parameter from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('event');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleCloseEventModal = () => {
    // console.log('Closing event modal');
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
    // Remove event parameter from URL if it exists
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('event');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  const handleExportCalendar = () => {
    // console.log('Export calendar clicked');
  };

  const handlePrintCalendar = () => {
    // Placeholder for print functionality
    window.print();
  };

  const handleOpenSettings = () => {
    // console.log('Settings clicked');
  };

  const handleOpenHelp = () => {
    // console.log('Help clicked');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground geometric-bg">
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
      {/* Main Title Section - Above main content */}
      <div className="py-16 text-center">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-4xl font-medium">Shared Calendar - Central VA ESOs</h1>
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
            <span>
              Powered by{' '}
              <a href="https://goodfix.co" className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">Good Fix</a>
              &nbsp;&copy; {currentYear}
              <span className="ml-4 mr-2 text-gray-300 select-none">|</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-300 underline transition-colors">
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
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
          initialData={editingEvent}
          selectedDate={selectedDate}
        />
      </ErrorBoundary>
    </div>
  );
}