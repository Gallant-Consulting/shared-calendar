import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, Link2, Building, MapPin, FileText } from 'lucide-react';
import type { Event } from '../types';
import {
  formatEventDateTimeRangeEastern,
  getEasternCalendarBadge,
} from '../utils/eventTime';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  if (!event) return null;

  const dateBadge = getEasternCalendarBadge(event.startDate);

  const isLikelyStreetAddress = (location: string) => {
    if (!location) return false;
    const streetSuffixes =
      /\b(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Court|Pl|Place|Circle|Cir|Pkwy|Parkway|Terrace|Ter|Loop|Trail|Trl|Crescent|Cres|Highway|Hwy)\b/i;
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
              <div className="bg-yellow-500 text-black px-3 py-2 rounded text-sm font-medium flex flex-col items-center min-w-[50px]">
                <div className="text-sm">{dateBadge.month}</div>
                <div className="text-lg font-bold leading-none">{dateBadge.day}</div>
              </div>

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
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                When
              </div>
              <div className="text-lg">{formatEventDateTimeRangeEastern(event)}</div>
            </div>
          </div>

          {event.hostOrganization && (
            <div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-green-500" />
                Hosted by
              </div>
              <div className="text-lg">{event.hostOrganization}</div>
            </div>
          )}

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
