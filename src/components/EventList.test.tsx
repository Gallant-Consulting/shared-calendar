import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Event } from '../types';
import { EventList } from './EventList';

function mkEvent(
  partial: Pick<Event, 'id' | 'title' | 'startDate' | 'endDate'> & Partial<Event>,
): Event {
  return {
    isAllDay: false,
    attendees: [{ name: 'Alex Beta', avatar: '' }],
    ...partial,
  };
}

describe('EventList', () => {
  it('renders Schedule header with first sorted event date and carousel navigation', () => {
    const events: Event[] = [
      mkEvent({
        id: 'e1',
        title: 'Earlier',
        startDate: new Date(2026, 5, 15, 9, 0),
        endDate: new Date(2026, 5, 15, 10, 30),
      }),
      mkEvent({
        id: 'e2',
        title: 'Later',
        startDate: new Date(2026, 5, 16, 14, 0),
        endDate: new Date(2026, 5, 16, 15, 0),
      }),
    ];

    render(
      <EventList
        events={events}
        allEvents={events}
        onEventClick={vi.fn()}
        currentFilter="all"
        onFilterChange={vi.fn()}
      />,
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Schedule');
    expect(heading).toHaveTextContent('June 15');

    expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();
  });
});
