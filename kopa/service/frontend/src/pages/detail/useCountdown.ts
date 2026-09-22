import { useEffect, useState } from 'react';
import { countdownTo, type Countdown } from '../../domain/dates';

/**
 * A once-a-second countdown to `target`.
 *
 * `live` is false for campaigns that have already closed — there is nothing to
 * tick towards, so no interval is created at all. The interval also stops once
 * the target passes, rather than re-rendering a frozen "00 00 00 00" forever.
 */
export function useCountdown(target: Date, live: boolean): Countdown {
  const [instant, setInstant] = useState<Date>(() => new Date());

  // `target` is rebuilt every render from the session's fixed `now`, so its
  // identity churns but this number does not — it is what the effect can key on.
  const targetMs = target.getTime();
  const expired = targetMs <= instant.getTime();

  useEffect(() => {
    if (!live || expired) return;

    const id = window.setInterval(() => setInstant(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [live, expired, targetMs]);

  return countdownTo(target, instant);
}
