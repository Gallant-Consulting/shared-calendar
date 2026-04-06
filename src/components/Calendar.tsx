import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import type { Event } from '../types';

interface CalendarProps {
  events: Event[];
  displayMonth?: Date;
  onDisplayMonthChange?: (month: Date) => void;
}

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function Calendar({ events, displayMonth, onDisplayMonthChange }: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState(() => monthStart(new Date()));
  const activeMonth = displayMonth ? monthStart(displayMonth) : internalMonth;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      const date = new Date(event.startDate);
      if (date.getFullYear() !== activeMonth.getFullYear() || date.getMonth() !== activeMonth.getMonth()) {
        continue;
      }
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [events, activeMonth]);

  const updateMonth = (nextMonth: Date) => {
    if (!displayMonth) {
      setInternalMonth(nextMonth);
    }
    onDisplayMonthChange?.(nextMonth);
  };

  const goPrev = () => {
    updateMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1));
  };

  const goNext = () => {
    updateMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1));
  };

  const firstDay = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0).getDate();
  const today = new Date();

  const isViewingCurrentMonth =
    activeMonth.getFullYear() === today.getFullYear() && activeMonth.getMonth() === today.getMonth();

  const goToToday = () => {
    updateMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 grid grid-cols-[minmax(0,auto)_1fr_minmax(0,auto)] items-center gap-x-2">
        <div className="flex items-center gap-1.5">
          <Button aria-label="Previous month" variant="ghost" size="icon" className="shrink-0" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!isViewingCurrentMonth && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 px-2 text-xs font-medium"
              onClick={goToToday}
            >
              Today
            </Button>
          )}
        </div>
        <h2 className="min-w-0 text-center text-xl font-medium sm:text-2xl">
          {activeMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <Button aria-label="Next month" variant="ghost" size="icon" className="shrink-0 justify-self-end" onClick={goNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-10" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const date = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), day);
          const key = `${date.getFullYear()}-${date.getMonth()}-${day}`;
          const count = eventsByDay.get(key) ?? 0;
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          return (
            <div
              key={day}
              className={`relative flex h-10 items-center justify-center rounded text-sm ${
                isToday ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {day}
              {count > 0 && (
                <span
                  aria-label={`${count} events`}
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}