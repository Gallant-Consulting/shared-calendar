import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('defaults to the current month when no display month is provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T12:00:00.000Z'));

    render(
      <Calendar
        events={[]}
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('March 2026');
  });

  it('renders the controlled month from props', () => {
    render(
      <Calendar
        events={[]}
        displayMonth={new Date(2026, 7, 1)}
      />
    );

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[headings.length - 1]).toHaveTextContent('August 2026');
  });

  it('notifies parent when next month is requested', () => {
    const onDisplayMonthChange = vi.fn();
    render(
      <Calendar
        events={[]}
        displayMonth={new Date(2026, 0, 1)}
        onDisplayMonthChange={onDisplayMonthChange}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /next month/i });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onDisplayMonthChange).toHaveBeenCalledTimes(1);
    expect(onDisplayMonthChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('jumps to the current month when Today is clicked', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T12:00:00.000Z'));

    const onDisplayMonthChange = vi.fn();
    render(
      <Calendar
        events={[]}
        displayMonth={new Date(2026, 0, 1)}
        onDisplayMonthChange={onDisplayMonthChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^today$/i }));
    expect(onDisplayMonthChange).toHaveBeenCalledTimes(1);
    const next = onDisplayMonthChange.mock.calls[0][0] as Date;
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(2);
  });
});
