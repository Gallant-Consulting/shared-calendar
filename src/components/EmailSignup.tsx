import { type FormEvent, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { subscribeByEmail } from '../services/subscribeApi';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function EmailSignup({ webhookUrl }: { webhookUrl: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus('loading');
    try {
      const res = await subscribeByEmail(webhookUrl, trimmed);
      if (!res.ok) throw new Error('Subscribe failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-4 w-full shrink-0 rounded-lg border border-border bg-card/80 p-3 shadow-sm">
      <p className="mt-2 mb-4 text-xs font-medium text-foreground">Get upcoming events in your inbox</p>

      {status === 'success' ? (
        <p className="text-xs text-muted-foreground" role="status">
          You&apos;re subscribed. You can unsubscribe from the link in any email.
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-2">
          <label htmlFor="event-email-signup" className="sr-only">
            Email for event list
          </label>
          <Input
            id="event-email-signup"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            disabled={status === 'loading'}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'event-email-signup-error' : undefined}
            className="text-sm"
          />
          {status === 'error' ? (
            <p id="event-email-signup-error" className="text-[11px] text-destructive" role="alert">
              Couldn&apos;t subscribe. Try again.
            </p>
          ) : null}
          <Button type="submit" size="sm" variant="outline" disabled={status === 'loading'} className="w-full">
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      )}
    </div>
  );
}
