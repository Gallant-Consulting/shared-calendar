import { useState } from 'react';
import { Filter, Link2, Building, MapPin, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import type { Event, FilterType } from '../types';
import {
  formatDateInputEastern,
  formatEventTimeEastern,
} from '../utils/eventTime';

interface EventListCompactProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  currentFilter: FilterType;
  maxEvents?: number;
  showFilters?: boolean;
}

export function EventListCompact({ 
  events, 
  onEventClick,
  currentFilter, 
  maxEvents = 5,
  showFilters = true
}: EventListCompactProps) {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const getFilterButtonText = (filter: FilterType) => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'nextMonth':
        return 'Next Month';
      case 'quarter':
        return 'This Quarter';
      case 'all':
      default:
        return 'All';
    }
  };

  const formatEventDate = (event: Event) => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const evDay = formatDateInputEastern(event.startDate);
    let dateStr: string;
    if (evDay === formatDateInputEastern(today)) {
      dateStr = 'Today';
    } else if (evDay === formatDateInputEastern(tomorrow)) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
      }).format(event.startDate);
    }

    if (event.isAllDay) {
      return `${dateStr} - All day`;
    }

    const startTime = formatEventTimeEastern(event.startDate);
    return `${dateStr}, ${startTime}`;
  };

  const sortedEvents = [...events].sort((a, b) => {
    // First, sort by date
    const dateA = new Date(a.startDate.getFullYear(), a.startDate.getMonth(), a.startDate.getDate());
    const dateB = new Date(b.startDate.getFullYear(), b.startDate.getMonth(), b.startDate.getDate());
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If same date, all-day events come first
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    
    // If both are all-day or both have times, sort by start time
    return a.startDate.getTime() - b.startDate.getTime();
  });
  const displayEvents = sortedEvents.slice(0, maxEvents);
  const hasMoreEvents = sortedEvents.length > maxEvents;

  return (
    <div className="w-full">
      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 px-2 py-1 h-auto"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <Filter className="h-3 w-3" />
            Filter
          </Button>

          {isFilterExpanded && (
            <>
              {(['all', 'today', 'week', 'month'] as FilterType[]).map((filter) => (
                <Button
                  key={filter}
                  variant={currentFilter === filter ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {}}
                  className={`px-2 py-1 text-xs h-auto ${
                    currentFilter === filter 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:text-white' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {getFilterButtonText(filter)}
                </Button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Events List */}
      {displayEvents.length > 0 ? (
        <div className="space-y-3">
          {displayEvents.map((event) => (
            <div 
              key={event.id}
              className={`p-3 bg-card rounded border border-border transition-colors ${
                onEventClick ? 'cursor-pointer hover:bg-muted/30' : ''
              }`}
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium truncate flex items-center gap-1">
                      {event.title}
                      <a
                        href={`?event=${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link2 className="h-3 w-3 inline" />
                      </a>
                    </h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">
                    {formatEventDate(event)}
                  </p>
                  
                  {/* Location or Organization */}
                  {(event.location || event.hostOrganization) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {event.location ? (
                        <>
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </>
                      ) : event.hostOrganization ? (
                        <>
                          <Building className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.hostOrganization}</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
                
                {/* Link Icon */}
                {event.link && (
                  <a 
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex-shrink-0 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {hasMoreEvents && (
            <div className="text-center py-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-600 text-sm"
                onClick={() => {}}
              >
                View all {sortedEvents.length} events
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No events found for {getFilterButtonText(currentFilter).toLowerCase()}
        </div>
      )}

      {/* Powered by footer */}
      <div className="mt-4 pt-3 border-t border-border text-center">
        <a 
          href="#" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Central VA Startup Events
        </a>
      </div>
    </div>
  );
}