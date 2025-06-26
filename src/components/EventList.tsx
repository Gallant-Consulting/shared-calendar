import React, { useState } from 'react';
import { Filter, Link2, FileText, Building, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Event, FilterType } from '../App';

interface EventListProps {
  events: Event[];
  allEvents: Event[];
  onEventClick: (event: Event) => void;
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  showHeader?: boolean;
}

export function EventList({ 
  events, 
  allEvents, 
  onEventClick, 
  currentFilter, 
  onFilterChange,
  showHeader = true
}: EventListProps) {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const getFilterButtonText = (filter: FilterType) => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'quarter':
        return 'This Quarter';
      case 'all':
      default:
        return 'All Events';
    }
  };

  const getFilterCount = (filter: FilterType) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return allEvents.filter(event => {
          const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
          return eventDate.getTime() === todayStart.getTime();
        }).length;
      
      case 'week':
        const weekStart = new Date(todayStart);
        weekStart.setDate(todayStart.getDate() - todayStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return allEvents.filter(event => {
          const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
          return eventDate >= weekStart && eventDate <= weekEnd;
        }).length;
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return allEvents.filter(event => {
          const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
          return eventDate >= monthStart && eventDate <= monthEnd;
        }).length;
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return allEvents.filter(event => {
          const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
          return eventDate >= quarterStart && eventDate <= quarterEnd;
        }).length;
      
      case 'all':
      default:
        return allEvents.length;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'ESO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'NETWORKING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const formatEventDate = (event: Event) => {
    const dateStr = event.startDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (event.isAllDay) {
      return `${dateStr} - All day`;
    }
    
    const startTime = event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${startTime} - ${endTime}`;
  };

  const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-medium mb-2">Central VA Startup Events</h2>
          <p className="text-muted-foreground">Discover networking opportunities and events in the Central Virginia startup ecosystem.</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        {/* Filter Toggle Button */}
        <Button 
          variant="outline" 
          className="text-blue-500 hover:text-blue-600 border-blue-500 hover:border-blue-600 text-sm flex items-center gap-2"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Filter className="h-4 w-4" />
          {isFilterExpanded ? 'Hide Filters' : `Filter Events (${events.length} of ${allEvents.length} shown)`}
        </Button>

        {/* Filter Options - Inline when expanded */}
        {isFilterExpanded && (
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'today', 'week', 'month', 'quarter'] as FilterType[]).map((filter) => (
              <Button
                key={filter}
                variant={currentFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(filter)}
                className={`px-4 py-2 text-sm ${
                  currentFilter === filter 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:text-white' 
                    : 'text-muted-foreground hover:text-foreground border-muted-foreground/20'
                }`}
              >
                {getFilterButtonText(filter)} ({getFilterCount(filter)})
              </Button>
            ))}
            
            {/* Clear Filter Button */}
            {currentFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange('all')}
                className="px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Events List */}
      {sortedEvents.length > 0 ? (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div 
              key={event.id}
              className="p-4 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium">{event.title}</h3>
                    
                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`${getTagColor(tag)} px-2 py-0 text-xs font-medium`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-base text-muted-foreground mb-2">
                    {formatEventDate(event)}
                  </p>
                  
                  {/* Host Organization and Location */}
                  {(event.hostOrganization || event.location) && (
                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                      {event.hostOrganization && (
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{event.hostOrganization}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{event.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Event Link */}
                  {event.link && (
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <a 
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {event.link}
                      </a>
                    </div>
                  )}
                  
                  {/* Event Notes/Description */}
                  {event.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {event.attendees.slice(0, 3).map((attendee, index) => (
                    <div key={index} className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm text-white">
                      {attendee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  ))}
                  {event.attendees.length > 3 && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                      +{event.attendees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-lg text-muted-foreground mb-2">No events found</p>
          <p className="text-sm text-muted-foreground">
            {currentFilter === 'all' 
              ? 'There are currently no events scheduled.' 
              : `No events found for ${getFilterButtonText(currentFilter).toLowerCase()}.`
            }
          </p>
        </div>
      )}

      {/* Footer for embeds */}
      <div className="mt-8 pt-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <a 
            href="#" 
            className="text-blue-400 hover:text-blue-300 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Central VA Startup Ecosystem
          </a>
        </p>
      </div>
    </div>
  );
}