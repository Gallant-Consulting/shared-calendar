import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users, Link2, Building, FileText } from 'lucide-react';
import type { Event } from '../types';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  if (!event) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTimeRange = () => {
    if (event.isAllDay) {
      return `${formatDate(event.startDate)} - All day`;
    }
    
    const startDate = formatDate(event.startDate);
    const startTime = formatTime(event.startDate);
    const endTime = formatTime(event.endDate);
    
    return `${startDate}, ${startTime} - ${endTime} EDT`;
  };

  const formatRepeat = () => {
    if (!event.repeat || event.repeat.frequency === 'none') {
      return null;
    }
    
    const frequency = {
      daily: 'Every day',
      weekly: 'Every week', 
      monthly: 'Every month'
    }[event.repeat.frequency];
    
    if (event.repeat.until) {
      const untilDate = event.repeat.until.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `${frequency} until ${untilDate}`;
    }
    
    return frequency;
  };

  const getDateBadge = () => {
    const month = event.startDate.toLocaleDateString('en-US', { month: 'short' });
    const day = event.startDate.getDate();
    return { month, day };
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

  const dateBadge = getDateBadge();

  // Simple street address validation
  const isLikelyStreetAddress = (location: string) => {
    if (!location) return false;
    // Must contain a number and a common street suffix
    const streetSuffixes = /\b(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Court|Pl|Place|Circle|Cir|Pkwy|Parkway|Terrace|Ter|Loop|Trail|Trl|Crescent|Cres|Highway|Hwy)\b/i;
    return /\d/.test(location) && streetSuffixes.test(location);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border border-border p-8">
        <DialogHeader>
          <DialogTitle className="sr-only">Event Details</DialogTitle>
          <DialogDescription className="sr-only">View details for {event.title}</DialogDescription>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {/* Date Badge */}
              <div className="bg-yellow-500 text-black px-3 py-2 rounded text-sm font-medium flex flex-col items-center min-w-[50px]">
                <div className="text-sm">{dateBadge.month}</div>
                <div className="text-lg font-bold leading-none">{dateBadge.day}</div>
              </div>
              
              {/* Event Title */}
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-medium">
                  {event.title}
                  <a
                    href={`?event=${event.id}`}
                    className="text-blue-400 hover:text-blue-300 ml-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link2 className="h-5 w-5 inline" />
                  </a>
                </h2>
                
                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`${getTagColor(tag)} px-3 py-1 text-xs font-medium`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* When */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                When
              </div>
              <div className="text-lg">{formatDateTimeRange()}</div>
            </div>
          </div>

          {/* Repeats */}
          {formatRepeat() && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                Repeats
              </div>
              <div className="text-lg">{formatRepeat()}</div>
            </div>
          )}

          {/* Host Organization */}
          {event.hostOrganization && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-green-500" />
                Hosted by
              </div>
              <div className="text-lg">{event.hostOrganization}</div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Location
              </div>
              <div className="text-lg">
                {isLikelyStreetAddress(event.location) ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {event.location}
                  </a>
                ) : (
                  event.location
                )}
              </div>
            </div>
          )}

          {/* With (Attendees) */}
          {event.attendees.length > 0 && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-pink-500" />
                With
              </div>
              <div className="flex items-center gap-3">
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-600 text-white text-sm">
                        {attendee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-lg">{attendee.name.split(' ')[0]} {attendee.name.split(' ')[1]?.[0]}.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link */}
          {event.link && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Link2 className="h-5 w-5 text-blue-500" />
                Link
              </div>
              <a 
                href={event.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg text-blue-400 hover:text-blue-300 hover:underline break-all"
              >
                {event.link}
              </a>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-yellow-500" />
                Notes
              </div>
              <div className="text-lg leading-relaxed">{event.notes}</div>
            </div>
          )}
        </div>

        {/* Bottom row: Actions */}
        <div className="flex items-center gap-4 mt-8 border-t border-gray-200 dark:border-border pt-6">
          <span className="text-base text-muted-foreground font-medium">Actions:</span>
          <Button variant="outline" className="text-base px-4 py-2" disabled>
            Add to my calendar
          </Button>
          <Button variant="outline" className="text-base px-4 py-2" disabled>
            Submit edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}