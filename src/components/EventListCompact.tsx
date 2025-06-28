import React, { useState } from 'react';
import { Filter, Link2, Building, MapPin, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Event, FilterType } from '../types';

interface EventListCompactProps {
  events: Event[];
  allEvents: Event[];
  onEventClick?: (event: Event) => void;
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  maxEvents?: number;
  showFilters?: boolean;
}

export function EventListCompact({ 
  events, 
  allEvents, 
  onEventClick,
  currentFilter, 
  onFilterChange,
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
      case 'quarter':
        return 'This Quarter';
      case 'all':
      default:
        return 'All';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'ESO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NETWORKING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatEventDate = (event: Event) => {
    const today = new Date();
    const eventDate = event.startDate;
    const isToday = eventDate.toDateString() === today.toDateString();
    const isTomorrow = eventDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    if (event.isAllDay) {
      return `${dateStr} - All day`;
    }
    
    const startTime = event.startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${dateStr}, ${startTime}`;
  };

  const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
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
                  onClick={() => onFilterChange(filter)}
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
                    
                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex gap-1">
                        {event.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`${getTagColor(tag)} px-1 py-0 text-xs`}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {event.tags.length > 2 && (
                          <Badge variant="outline" className="px-1 py-0 text-xs">
                            +{event.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
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
                onClick={() => onFilterChange('all')}
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