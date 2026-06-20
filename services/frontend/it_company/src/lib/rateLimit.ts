/**
 * Client-side rate limiter using localStorage.
 * Prevents rapid re-submissions of contact / career forms.
 */

const COOLDOWN_MS = 60_000; // 60 seconds between submissions

/** Returns the localStorage key for a given form type. */
function storageKey(formType: string): string {
  return `rate_limit_${formType}`;
}

/**
 * Check whether the user is currently rate-limited for this form type.
 * @returns seconds remaining, or 0 if not limited.
 */
export function getRateLimitSecondsRemaining(formType: string): number {
  try {
    const raw = localStorage.getItem(storageKey(formType));
    if (!raw) return 0;
    const lastSubmitMs = Number(raw);
    if (Number.isNaN(lastSubmitMs)) return 0;
    const elapsed = Date.now() - lastSubmitMs;
    if (elapsed >= COOLDOWN_MS) return 0;
    return Math.ceil((COOLDOWN_MS - elapsed) / 1000);
  } catch {
    return 0; // localStorage unavailable (private browsing etc.)
  }
}

/** Record a successful submission for rate-limit tracking. */
export function recordSubmission(formType: string): void {
  try {
    localStorage.setItem(storageKey(formType), String(Date.now()));
  } catch {
    // ignore — non-critical
  }
}
