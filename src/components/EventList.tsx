import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from './ui/button';
import type { Event, FilterType, Tag } from '../types';
import { AVAILABLE_TAGS, TAG_LABELS } from '../types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { ScheduleEventCard } from './ScheduleEventCard';

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

  const formatScheduleHeaderDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

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
    <div className="mx-auto w-full max-w-6xl">
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

      {/* Schedule carousel */}
      {sortedEvents.length > 0 ? (
        <Carousel
          opts={{ align: 'start', slidesToScroll: 1 }}
          className="w-full"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Schedule
                <span className="font-normal text-muted-foreground">
                  {' '}
                  — {formatScheduleHeaderDate(sortedEvents[0].startDate)}
                </span>
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CarouselPrevious
                variant="outline"
                className="static inset-auto left-auto right-auto top-auto size-9 translate-x-0 translate-y-0 rounded-md border bg-background shadow-sm"
              />
              <CarouselNext
                variant="outline"
                className="static inset-auto left-auto right-auto top-auto size-9 translate-x-0 translate-y-0 rounded-md border bg-background shadow-sm"
              />
            </div>
          </div>
          <CarouselContent className="-ml-2 md:-ml-4">
            {sortedEvents.map((event) => (
              <CarouselItem
                key={event.id}
                className="pl-2 md:basis-[45%] md:pl-4 lg:basis-[32%] basis-[85%]"
              >
                <ScheduleEventCard event={event} onEventClick={onEventClick} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
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