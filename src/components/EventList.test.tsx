import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  beforeEach(() => {
    class MockIntersectionObserver {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders search input and raises search updates', () => {
    const events: Event[] = [
      mkEvent({
        id: 'e1',
        title: 'Marketing Workshop',
        startDate: new Date(2026, 5, 15, 9, 0),
        endDate: new Date(2026, 5, 15, 10, 30),
      }),
    ];
    const onSearchQueryChange = vi.fn();
    render(
      <EventList
        events={events}
        onEventClick={vi.fn()}
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
        hasMore={false}
        onLoadMore={vi.fn()}
        scrollContainerHeight="480px"
      />,
    );

    const input = screen.getByPlaceholderText(/search for an event/i);
    fireEvent.change(input, { target: { value: 'workshop' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('workshop');
  });

  it('renders only the passed visible events in a vertical list', () => {
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
        events={[events[0]]}
        onEventClick={vi.fn()}
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        hasMore={true}
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.getByText('Earlier')).toBeInTheDocument();
    expect(screen.queryByText('Later')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /previous slide/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next slide/i })).not.toBeInTheDocument();
  });

  it('calls onLoadMore when manual load-more control is clicked', () => {
    const events: Event[] = [
      mkEvent({
        id: 'e1',
        title: 'Earlier',
        startDate: new Date(2026, 5, 15, 9, 0),
        endDate: new Date(2026, 5, 15, 10, 30),
      }),
    ];
    const onLoadMore = vi.fn();

    render(
      <EventList
        events={events}
        onEventClick={vi.fn()}
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        hasMore={true}
        onLoadMore={onLoadMore}
      />,
    );

    const loadMoreButtons = screen.getAllByRole('button', { name: /load more events/i });
    fireEvent.click(loadMoreButtons[loadMoreButtons.length - 1]);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
