import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users, Link2, Building, FileText, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import type { Event } from '../types';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  event: Event | null;
}

export function EventDetailsModal({ isOpen, onClose, onEdit, event }: EventDetailsModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border border-border p-8">
        <DialogHeader>
          <DialogTitle className="sr-only">Event Details</DialogTitle>
          <DialogDescription className="sr-only">View details for {event.title}</DialogDescription>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Date Badge */}
              <div className="bg-yellow-500 text-black px-3 py-2 rounded text-sm font-medium flex flex-col items-center min-w-[50px]">
                <div className="text-sm">{dateBadge.month}</div>
                <div className="text-lg font-bold leading-none">{dateBadge.day}</div>
              </div>
              
              {/* Event Title */}
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-medium">{event.title}</h2>
                
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
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onEdit} className="text-muted-foreground hover:text-foreground px-4 py-2">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* When */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-base font-medium text-muted-foreground mb-2">When</div>
              <div className="text-lg">{formatDateTimeRange()}</div>
            </div>
            <Button variant="link" className="text-blue-400 hover:text-blue-300 text-base p-0 h-auto">
              Add to my calendar...
            </Button>
          </div>

          {/* Repeats */}
          {formatRepeat() && (
            <div>
              <div className="text-base font-medium text-muted-foreground mb-2">Repeats</div>
              <div className="text-lg">{formatRepeat()}</div>
            </div>
          )}

          {/* Host Organization */}
          {event.hostOrganization && (
            <div>
              <div className="text-base font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hosted by
              </div>
              <div className="text-lg">{event.hostOrganization}</div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div>
              <div className="text-base font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <div className="text-lg">{event.location}</div>
            </div>
          )}

          {/* With (Attendees) */}
          {event.attendees.length > 0 && (
            <div>
              <div className="text-base font-medium text-muted-foreground mb-3">With</div>
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
              <div className="text-base font-medium text-muted-foreground mb-2">Link</div>
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
              <div className="text-base font-medium text-muted-foreground mb-2">Notes</div>
              <div className="text-lg leading-relaxed">{event.notes}</div>
            </div>
          )}

          {/* Added by */}
          <div className="pt-6 border-t border-border">
            <div className="text-sm text-muted-foreground mb-3">Added by</div>
            <div className="flex items-center gap-2">
              <span className="text-base text-muted-foreground">
                {event.attendees[0]?.name.split(' ')[0]} {event.attendees[0]?.name.split(' ')[1]?.[0]}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}