import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults the first visible month to the current month on load', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T12:00:00.000Z'));

    render(
      <Calendar
        events={[]}
        allEvents={[]}
        onDateSelect={vi.fn()}
        onEventClick={vi.fn()}
        onNewEventClick={vi.fn()}
        currentFilter="all"
      />
    );

    const monthHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(monthHeadings[0]).toHaveTextContent('March');
  });
});
