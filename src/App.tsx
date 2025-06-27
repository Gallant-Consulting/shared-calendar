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

export type FilterType = 'all' | 'today' | 'week' | 'month' | 'quarter';

// Available tag options
export const AVAILABLE_TAGS = ['ESO', 'PAID', 'NETWORKING'] as const;

// Sample events for demonstration
const generateSampleEvents = (): Event[] => [
  {
    id: 'sample-1',
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
    id: 'sample-2',
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
    id: 'sample-3',
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
    id: 'sample-4',
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
    id: 'sample-5',
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
  const [events, setEvents] = useState<Event[]>(generateSampleEvents()); // Start with sample events
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Set to current date by default
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('week');

  useEffect(() => {
    // Apply theme class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Debug logging
  useEffect(() => {
    console.log('EventModal state changed:', { 
      isEventModalOpen, 
      editingEvent: editingEvent?.id, 
      selectedDate: selectedDate?.toDateString() 
    });
  }, [isEventModalOpen, editingEvent, selectedDate]);

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
    console.log('handleNewEvent called with:', date);
    console.log('About to set modal state...');
    
    try {
      setSelectedDate(date || null);
      setEditingEvent(null);
      setIsEventModalOpen(true);
      console.log('Modal state set successfully');
    } catch (error) {
      console.error('Error in handleNewEvent:', error);
    }
  };

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleEditEventFromDetails = () => {
    if (viewingEvent) {
      setEditingEvent(viewingEvent);
      setIsEventDetailsOpen(false);
      setIsEventModalOpen(true);
    }
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    console.log('Saving event:', eventData);
    try {
      if (editingEvent) {
        setEvents(prev => prev.map(e => 
          e.id === editingEvent.id 
            ? { ...eventData, id: editingEvent.id }
            : e
        ));
      } else {
        const newEvent: Event = {
          ...eventData,
          id: Date.now().toString()
        };
        setEvents(prev => [...prev, newEvent]);
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setViewingEvent(null);
  };

  const handleCloseEventModal = () => {
    console.log('Closing event modal');
    setIsEventModalOpen(false);
    setEditingEvent(null);
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
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
          initialData={editingEvent}
          selectedDate={selectedDate}
        />
      </ErrorBoundary>
    </div>
  );
}