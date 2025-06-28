import React, { useState } from 'react';
import { Filter, Link2, FileText, Building, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Event, FilterType, Tag } from '../types';
import { AVAILABLE_TAGS, TAG_LABELS } from '../types';

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
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Filter events by selected tags
  const filterEventsByTags = (events: Event[], tags: Tag[]): Event[] => {
    if (tags.length === 0) return events;
    return events.filter(event => 
      event.tags && event.tags.some(tag => tags.includes(tag))
    );
  };

  // Apply both time and tag filters
  const filteredEvents = filterEventsByTags(events, selectedTags);

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
      
      case 'nextMonth':
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        return allEvents.filter(event => {
          const eventDate = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
          return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
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

  const isLikelyStreetAddress = (location: string) => {
    if (!location) return false;
    const streetSuffixes = /\b(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Court|Pl|Place|Circle|Cir|Pkwy|Parkway|Terrace|Ter|Loop|Trail|Trl|Crescent|Cres|Highway|Hwy)\b/i;
    return /\d/.test(location) && streetSuffixes.test(location);
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

  const sortedEvents = [...filteredEvents].sort((a, b) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Filter Section */}
      {allEvents.length > 1 && (
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          {/* Filter Toggle Button */}
          <Button 
            variant="outline" 
            className="text-blue-500 hover:text-blue-600 border-blue-500 hover:border-blue-600 text-sm flex items-center gap-2"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <Filter className="h-4 w-4" />
            {isFilterExpanded ? 'Hide Filters' : `Filter Events (${filteredEvents.length} of ${allEvents.length} shown)`}
          </Button>

          {/* Filter Options - Inline when expanded */}
          {isFilterExpanded && (
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'today', 'week', 'month', 'nextMonth', 'quarter'] as FilterType[]).map((filter) => (
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

          {/* Tag Filter Section */}
          {isFilterExpanded && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">Filter by tags:</span>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTagFilters}
                    className="px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Clear tags
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {AVAILABLE_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-xs ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:text-white'
                        : 'text-muted-foreground hover:text-foreground border-muted-foreground/20'
                    }`}
                  >
                    {TAG_LABELS[tag]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events List */}
      {sortedEvents.length > 0 ? (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div 
              key={event.id}
              className="p-5 bg-gray-100 dark:bg-gray-800 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      {event.title}
                      <a
                        href={`?event=${event.id}`}
                        className="text-blue-400 hover:text-blue-300"
                        onClick={e => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Link2 className="h-4 w-4 inline" />
                      </a>
                    </h3>
                    
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
                    <div className="mt-2">
                      {event.hostOrganization && (
                        <div className="flex items-center gap-1 mb-2">
                          <Building className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{event.hostOrganization}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          {isLikelyStreetAddress(event.location) ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {event.location}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">{event.location}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Event Link */}
                  {event.link && (
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
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
                      <FileText className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
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
    </div>
  );
}