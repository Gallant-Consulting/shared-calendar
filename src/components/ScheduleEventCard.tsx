import { MapPin } from 'lucide-react';
import type { Event } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from './ui/utils';
import {
  formatEventTimeEastern,
  formatMonthNameLongEastern,
} from '../utils/eventTime';

function formatTimeRange(event: Event): string {
  if (event.isAllDay) {
    return 'ALL DAY';
  }
  const start = formatEventTimeEastern(event.startDate);
  const end = formatEventTimeEastern(event.endDate);
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
  accentColor: string;
}

export function ScheduleEventCard({ event, accentColor }: ScheduleEventCardProps) {
  const hasLocation = Boolean(event.location?.trim());
  const locationLabel = event.location?.trim() ?? '';
  const hasLink = Boolean(event.link?.trim());
  const timeLabel = formatTimeRange(event);

  const accentStyle = { color: accentColor } as const;
  const borderAccentStyle = { borderLeftColor: accentColor } as const;

  const dayNumber = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      day: 'numeric',
    }).format(event.startDate),
  );

  return (
    <div
      style={borderAccentStyle}
      className={cn(
        'flex flex-col rounded-md border border-border bg-card p-5 text-left shadow-sm',
        'border-l-4 border-solid',
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {hasLink ? (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-lg font-semibold leading-snug tracking-tight text-foreground underline decoration-transparent decoration-2 underline-offset-2 transition-colors hover:decoration-foreground/30"
            >
              {event.title}
            </a>
          ) : (
            <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{event.title}</h3>
          )}
          {event.hostOrganization?.trim() ? (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Hosted by{' '}
              <span className="font-medium text-foreground/90">{event.hostOrganization.trim()}</span>
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right" style={accentStyle}>
          <div className="text-4xl font-light leading-none tabular-nums">{dayNumber}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {formatMonthNameLongEastern(event.startDate)}
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{timeLabel}</p>
        </div>
      </div>

      {event.imageUrl ? (
        <div className="mb-4 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30">
          <ImageWithFallback
            src={event.imageUrl}
            alt={event.title}
            className="max-h-56 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <p
        className={cn(
          'mb-4 min-h-[1.5rem] text-sm text-muted-foreground',
          event.notes ? 'line-clamp-4' : 'line-clamp-1 italic opacity-70',
        )}
      >
        {event.notes ?? 'No description'}
      </p>

      <div className="mt-auto border-t border-border/60 pt-3">
        {hasLocation ? (
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" style={accentStyle} aria-hidden />
            {isLikelyStreetAddress(locationLabel) ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-500 hover:underline"
              >
                {locationLabel}
              </a>
            ) : (
              <span className="truncate">{locationLabel}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground/60">No location</span>
        )}
      </div>
    </div>
  );
}
