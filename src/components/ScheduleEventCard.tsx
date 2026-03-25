import { Link2, MapPin, MoreHorizontal } from 'lucide-react';
import type { Event } from '../types';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';

function getAccentBorderClass(event: Event): string {
  const first = event.tags?.[0];
  switch (first) {
    case 'ESO':
      return 'border-l-blue-600';
    case 'PAID':
      return 'border-l-green-600';
    case 'NETWORKING':
      return 'border-l-purple-600';
    case 'VIRTUAL':
      return 'border-l-sky-600';
    default:
      return 'border-l-primary';
  }
}

function formatTimeRange(event: Event): string {
  if (event.isAllDay) {
    return 'ALL DAY';
  }
  const start = event.startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const end = event.endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${start} — ${end}`;
}

function isLikelyStreetAddress(location: string): boolean {
  if (!location) return false;
  const streetSuffixes =
    /\b(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Court|Pl|Place|Circle|Cir|Pkwy|Parkway|Terrace|Ter|Loop|Trail|Trl|Crescent|Cres|Highway|Hwy)\b/i;
  return /\d/.test(location) && streetSuffixes.test(location);
}

export interface ScheduleEventCardProps {
  event: Event;
  onEventClick: (event: Event) => void;
}

export function ScheduleEventCard({ event, onEventClick }: ScheduleEventCardProps) {
  const hasLocation = Boolean(event.location?.trim());
  const locationLabel = event.location?.trim() ?? '';

  const copyEventLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('event', event.id);
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // ignore clipboard failures (e.g. insecure context)
    }
  };

  return (
    <div
      onClick={() => onEventClick(event)}
      className={cn(
        'flex h-full cursor-pointer flex-col rounded-xl border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md',
        'border-l-4',
        getAccentBorderClass(event),
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatTimeRange(event)}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onSelect={() => {
                onEventClick(event);
              }}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void copyEventLink()}>Copy event link</DropdownMenuItem>
            {event.link ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={event.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Link2 className="size-3.5" />
                    Open meeting link
                  </a>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mb-2 text-base font-semibold leading-snug text-foreground">{event.title}</h3>

      <p
        className={cn(
          'mb-4 min-h-[2.5rem] flex-1 text-sm text-muted-foreground',
          event.notes ? 'line-clamp-3' : 'line-clamp-1 opacity-60',
        )}
      >
        {event.notes ?? 'No description'}
      </p>

      <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-3">
        {hasLocation ? (
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-purple-500" />
            {isLikelyStreetAddress(locationLabel) ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {locationLabel}
              </a>
            ) : (
              <span className="truncate">{locationLabel}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {event.attendees.slice(0, 3).map((attendee, index) => (
              <div
                key={index}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs text-white"
              >
                {attendee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            ))}
            {event.attendees.length > 3 && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                +{event.attendees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
