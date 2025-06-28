import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Link2, FileText, ChevronUp, ChevronDown, Filter, Calendar as CalendarIcon, EyeOff, Building, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AVAILABLE_TAGS, TAG_LABELS } from '../types';
import type { Event, FilterType, Tag } from '../types';

interface CalendarProps {
  events: Event[];
  allEvents: Event[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onNewEventClick: (date: Date) => void;
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function Calendar({ 
  events, 
  allEvents, 
  onDateSelect, 
  onEventClick, 
  onNewEventClick, 
  currentFilter, 
  onFilterChange 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5, 1)); // June 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Initialize with today's date
  const [selectedTags, setSelectedTags] = useState<Tag[]>([...AVAILABLE_TAGS]);
  const [showTagFilters, setShowTagFilters] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date, includeYear: boolean = false) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[date.getMonth()];
    
    if (includeYear && date.getFullYear() !== currentYear) {
      return `${monthName} ${date.getFullYear()}`;
    }
    
    return monthName;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const goToToday = () => {
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(todayMonth);
    setSelectedDate(today);
    onDateSelect(today);
  };

  const getEventsForDate = (date: Date, eventList: Event[] = allEvents) => {
    return eventList.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTags([...AVAILABLE_TAGS]);
    onDateSelect(date);
  };

  const handleAddEventClick = () => {
    if (selectedDate) {
      onNewEventClick(selectedDate);
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();
  };

  const isDateBeyondToday = () => {
    if (!selectedDate) return false;
    return selectedDate > today || currentMonth.getFullYear() > currentYear || 
           (currentMonth.getFullYear() === currentYear && currentMonth.getMonth() > today.getMonth());
  };

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

  // Render event indicator based on number of events
  const renderEventIndicator = (eventCount: number) => {
    if (eventCount === 0) return null;

    if (eventCount === 1) {
      return (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
        </div>
      );
    }

    if (eventCount === 2) {
      return (
        <div className="absolute bottom-2 left-1/2 flex gap-0.5 transform -translate-x-1/2">
          <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
        </div>
      );
    }

    if (eventCount >= 3) {
      return (
        <div className="absolute bottom-2 left-1/2 flex gap-0.5 transform -translate-x-1/2">
          <div className="w-1.5 h-1.5 bg-yellow-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
        </div>
      );
    }

    return null;
  };

  const renderMonth = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days = [];

    // Track which grid cells are date cells for border logic
    const grid: ('empty' | 'date')[] = [];
    for (let i = 0; i < firstDay; i++) grid.push('empty');
    for (let day = 1; day <= daysInMonth; day++) grid.push('date');
    while (grid.length < 42) grid.push('empty');

    for (let i = 0; i < 42; i++) {
      const rowIdx = Math.floor(i / 7);
      const colIdx = i % 7;
      const isFirstColumn = colIdx === 0;
      const isFirstRow = rowIdx === 0;
      const cellType = grid[i];

      if (cellType === 'date') {
        const day = i - firstDay + 1;
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const dayEvents = getEventsForDate(date, allEvents);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

        // Add left border if first column OR the cell to the left is empty
        const leftBorder = isFirstColumn || grid[i - 1] === 'empty';
        // Add top border if in the first row (i < 7) or if the cell above is empty
        const topBorder = i < 7 || grid[i - 7] === 'empty';

        days.push(
          <div
            key={day}
            className={`h-16 flex items-center justify-center cursor-pointer relative border-r border-b border-border
              ${leftBorder ? 'border-l border-border' : ''}
              ${topBorder ? 'border-t border-border' : ''}
              ${isSelected ? 'bg-gray-100 dark:bg-muted' : ''}
              ${isToday ? 'text-blue-400' : ''}
              hover:bg-white/5 transition-colors`}
            onClick={() => handleDateClick(date)}
          >
            <span className="text-base">{day}</span>
            {renderEventIndicator(dayEvents.length)}
          </div>
        );
      } else {
        // Empty cell: no borders
        days.push(
          <div
            key={`empty-${i}`}
            className="h-16"
          />
        );
      }
    }
    return days;
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const selectedDateEvents = filterEventsByDateAndTags(events, selectedDate, selectedTags);
  const allEventsForSelectedDate = selectedDate ? getEventsForDate(selectedDate, events) : [];

  // Sort by start time
  selectedDateEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const handleTagClick = (tag: Tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
  };

  // Tag-related helpers
  const getTagLabel = (tag: Tag) => TAG_LABELS[tag] || tag;
  const isValidTag = (tag: string): tag is Tag => (AVAILABLE_TAGS as readonly string[]).includes(tag);
  const getTagCountForSelectedDate = (tag: Tag) => {
    if (!selectedDate) return 0;
    return getEventsForDate(selectedDate, events).filter(event =>
      event.tags && event.tags.filter(isValidTag).includes(tag)
    ).length;
  };

  // Utility: filter events for a date and selected tags
  function filterEventsByDateAndTags(events: Event[], date: Date | null, selectedTags: Tag[]): Event[] {
    if (!date) return [];
    const eventsForDate = getEventsForDate(date, events);
    if (selectedTags.length === 0) return [];
    if (selectedTags.length === AVAILABLE_TAGS.length) return eventsForDate;
    return eventsForDate.filter(event =>
      event.tags && event.tags.some(tag => selectedTags.includes(tag))
    );
  }

  // Simple street address validation (same as EventDetailsModal)
  const isLikelyStreetAddress = (location: string) => {
    if (!location) return false;
    const streetSuffixes = /\b(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Court|Pl|Place|Circle|Cir|Pkwy|Parkway|Terrace|Ter|Loop|Trail|Trl|Crescent|Cres|Highway|Hwy)\b/i;
    return /\d/.test(location) && streetSuffixes.test(location);
  };

  return (
    <div className="w-full">
      {/* Calendar View - Always shown */}
      <div className="bg-card rounded-lg p-8">
        {/* Calendar grid - Side by side months */}
        <div className="grid grid-cols-2 gap-12">
          {/* First Month */}
          <div className="space-y-3">
            {/* Month header with navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateMonth('prev')}
                  className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 h-8 w-8"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {/* Today button - inline with previous button when needed */}
                {isDateBeyondToday() && (
                  <Button
                    variant="outline"
                    onClick={goToToday}
                    className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:text-blue-800 px-3 h-8 text-sm dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-800"
                  >
                    Today
                  </Button>
                )}
              </div>
              <h2 className="text-xl font-medium text-center flex-1">{getMonthName(currentMonth, true)}</h2>
              <div className="w-8"></div> {/* Spacer for symmetry */}
            </div>
            {/* Days of week header */}
            <div className="grid grid-cols-7">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                <div 
                  key={day} 
                  className={`h-12 flex items-center justify-center text-sm text-muted-foreground font-medium border-r border-t border-b border-border bg-gray-100 dark:bg-muted ${index === 0 ? 'border-l' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 min-h-[24rem]">
              {renderMonth(currentMonth)}
            </div>
          </div>
          {/* Second Month */}
          <div className="space-y-3">
            {/* Month header with navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-8"></div> {/* Spacer for symmetry */}
              <h2 className="text-xl font-medium text-center flex-1">{getMonthName(nextMonth, true)}</h2>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateMonth('next')}
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 h-8 w-8"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            {/* Days of week header */}
            <div className="grid grid-cols-7">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
                <div 
                  key={day} 
                  className={`h-12 flex items-center justify-center text-sm text-muted-foreground font-medium border-r border-t border-b border-border bg-gray-100 dark:bg-muted ${index === 0 ? 'border-l' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 min-h-[24rem]">
              {renderMonth(nextMonth)}
            </div>
          </div>
        </div>
      </div>

      {/* Selected date info - only show when a date is selected */}
      {selectedDate && (
        <>
          <div className="mt-4 ml-8 flex items-center gap-4 border-b border-gray-200 dark:border-border pb-4">
            <CalendarIcon className="w-6 h-6 text-yellow-500" />
            <span className="text-lg text-muted-foreground">{formatSelectedDate(selectedDate)}</span>
            <span className="mx-3 text-gray-300 select-none">|</span>
            <span className="text-lg text-muted-foreground ml-0">
              {allEventsForSelectedDate.length === 0 ? "Nothing's on the schedule" :
                `${allEventsForSelectedDate.length} event${allEventsForSelectedDate.length === 1 ? '' : 's'}`}
            </span>
          </div>

          {/* Tag filter toggle and buttons - moved here */}
          {selectedDate && allEventsForSelectedDate.length > 0 && (
            <div className="mt-4 ml-8">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 p-0 h-auto"
                onClick={() => setShowTagFilters(v => !v)}
              >
                <Filter className="h-4 w-4" />
                {showTagFilters ? 'Hide Filters' : 'Filter'}
              </Button>
              {showTagFilters && (
                <div className="flex flex-wrap items-center gap-2 ml-2 mb-4">
                  {AVAILABLE_TAGS.map(tag => {
                    const count = getTagCountForSelectedDate(tag as Tag);
                    return (
                      <Button
                        type="button"
                        key={tag}
                        variant={selectedTags.includes(tag as Tag) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTagClick(tag as Tag)}
                        className={`px-3 py-1 text-xs ${selectedTags.includes(tag as Tag) ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}
                      >
                        {getTagLabel(tag as Tag)}{count > 0 ? ` (${count})` : ''}
                      </Button>
                    );
                  })}
                  {/* Clear filter button */}
                  {selectedTags.length < AVAILABLE_TAGS.length && (
                    <Button
                      type="button"
                      variant="default" // More prominent style
                      size="sm"
                      onClick={() => setSelectedTags([...AVAILABLE_TAGS])}
                      className="px-3 py-1 text-xs text-white bg-red-500 hover:bg-red-600 border-red-500"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Show events for selected date */}
          {selectedDateEvents.length > 0 ? (
            <div className="mt-6 space-y-4 ml-8">
              {selectedDateEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-5 bg-gray-100 dark:bg-gray-800 rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium flex items-center gap-2">
                          {event.title}
                          <a
                            href={`/event/${event.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={e => e.stopPropagation()}
                          >
                            <Link2 className="h-4 w-4 inline" />
                          </a>
                        </h4>
                        
                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(event.tags.filter(isValidTag) as Tag[]).map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={`${getTagColor(tag as Tag)} px-2 py-0 text-xs font-medium`}
                              >
                                {getTagLabel(tag as Tag)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-base text-muted-foreground mt-1 mb-4">
                        {event.isAllDay ? 'All day' : 
                         `${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        }
                      </p>
                      
                      {/* Host Organization and Location */}
                      {(event.hostOrganization || event.location) && (
                        <div className="mt-2">
                          {event.hostOrganization && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{event.hostOrganization}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 mt-3">
                              <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {isLikelyStreetAddress(event.location) ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 hover:underline"
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
                        <div className="flex items-center gap-2 mt-3">
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
                        <div className="flex items-start gap-2 mt-3">
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
          ) : allEventsForSelectedDate.length > 0 ? (
            <div className="mt-6 text-center text-muted-foreground">
              No events match your filter. <span className="font-semibold text-blue-600">Clear filters to see all events.</span>
            </div>
          ) : null}

          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={handleAddEventClick}
              className="text-blue-500 hover:text-blue-600 border-blue-500 hover:border-blue-600 rounded-full px-4 py-2 flex items-center gap-2 h-auto text-sm"
            >
              <Plus className="h-4 w-4" />
              New event
            </Button>
          </div>
        </>
      )}

      {/* Empty state - show when no events and no selected date */}
      {!selectedDate && events.length === 0 && (
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            {currentFilter === 'all' ? 'There are currently no events' : `No events found for ${getFilterButtonText(currentFilter).toLowerCase()}`}
          </span>
        </div>
      )}
    </div>
  );
}