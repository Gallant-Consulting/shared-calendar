import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Link2, FileText, ChevronUp, ChevronDown, Filter, Calendar as CalendarIcon, EyeOff, Building, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Event, FilterType } from '../types';

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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
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
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>
      );
    }

    if (eventCount === 2) {
      return (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          </div>
        </div>
      );
    }

    // 3 or more events
    return (
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
        </div>
      </div>
    );
  };

  const renderMonth = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const isFirstColumn = i === 0;
      const isFirstRow = true; // Empty cells are always in the first row
      days.push(
        <div 
          key={`empty-${i}`} 
          className={`h-16 border-r border-b border-border ${isFirstColumn ? 'border-l' : ''} ${isFirstRow ? 'border-t' : ''}`}
        />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const dayEvents = getEventsForDate(date, allEvents);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
      // Calculate column position for border logic
      const cellIndex = firstDay + day - 1;
      const isFirstColumn = cellIndex % 7 === 0;
      const isFirstRow = cellIndex < 7; // First row contains cells 0-6

      days.push(
        <div
          key={day}
          className={`h-16 flex items-center justify-center cursor-pointer relative border-r border-b border-border 
            ${isFirstColumn ? 'border-l' : ''}
            ${isFirstRow ? 'border-t' : ''}
            ${isSelected ? 'bg-white/10' : ''}
            ${isToday ? 'text-blue-400' : ''}
            hover:bg-white/5 transition-colors`}
          onClick={() => handleDateClick(date)}
        >
          <span className="text-base">{day}</span>
          {renderEventIndicator(dayEvents.length)}
        </div>
      );
    }

    return days;
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate, events) : [];

  return (
    <div className="w-full">
      {/* Calendar View - Only when expanded */}
      {isCalendarExpanded && (
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
                      className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 px-3 h-8 text-sm"
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
                    className={`h-12 flex items-center justify-center text-sm text-muted-foreground font-medium border-r border-t border-b border-border bg-muted/20 ${index === 0 ? 'border-l' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7">
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
                    className={`h-12 flex items-center justify-center text-sm text-muted-foreground font-medium border-r border-t border-b border-border bg-muted/20 ${index === 0 ? 'border-l' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7">
                {renderMonth(nextMonth)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section - Single Line Layout with Calendar Toggle - moved outside selectedDate block */}
      <div className="mt-6 flex items-center gap-4">
        {/* Calendar Toggle Button - only show when there are events for the selected date */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <Button 
            variant="link" 
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 p-0 h-auto"
            onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
          >
            {isCalendarExpanded ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Calendar
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4" />
                Show Calendar
              </>
            )}
          </Button>
        )}

        {/* Filter Toggle Button */}
        <Button 
          variant="link" 
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 p-0 h-auto"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <Filter className="h-4 w-4" />
          {isFilterExpanded ? 'Hide Filters' : `Filter Events (${events.length} of ${allEvents.length} shown)`}
        </Button>

        {/* Filter Options - Inline when expanded */}
        {isFilterExpanded && (
          <div className="flex items-center gap-2">
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

      {/* Selected date info - only show when a date is selected */}
      {selectedDate && (
        <>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-6 h-6 bg-yellow-500 rounded-sm"></div>
            <span className="text-lg text-muted-foreground">{formatSelectedDate(selectedDate)}</span>
            <span className="text-lg text-muted-foreground ml-6">
              {selectedDateEvents.length === 0 ? "Nothing's on the schedule" : 
               `${selectedDateEvents.length} event${selectedDateEvents.length === 1 ? '' : 's'}`}
            </span>
          </div>

          {/* Show events for selected date */}
          {selectedDateEvents.length > 0 && (
            <div className="mt-6 space-y-4">
              {selectedDateEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-5 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium">{event.title}</h4>
                        
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
                      
                      <p className="text-base text-muted-foreground mt-1">
                        {event.isAllDay ? 'All day' : 
                         `${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        }
                      </p>
                      
                      {/* Host Organization and Location */}
                      {(event.hostOrganization || event.location) && (
                        <div className="flex items-center gap-4 mt-2">
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
          )}

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