import React, { useState, useEffect } from 'react';
import { EventList } from 'src/components/EventList';
import { EventDetailsModal } from 'src/components/EventDetailsModal';
import { Event } from 'src/components/Event';
import { FilterType, AVAILABLE_TAGS } from './App';

// Same sample events as main app for consistency
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

export default function EmbedApp() {
  const [events] = useState<Event[]>(generateSampleEvents());
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('week');

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

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setViewingEvent(null);
  };

  const handleEditEventFromDetails = () => {
    // For embed version, we'll just close the modal since we don't have editing capability
    handleCloseEventDetails();
  };

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Event List */}
      <EventList
        events={filteredEvents}
        allEvents={events}
        onEventClick={handleViewEvent}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        showHeader={true}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isEventDetailsOpen}
        onClose={handleCloseEventDetails}
        onEdit={handleEditEventFromDetails}
        event={viewingEvent}
      />
    </div>
  );
}