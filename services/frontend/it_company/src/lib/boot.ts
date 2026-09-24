import { normalizePath } from '../i18n/locales';

/** Class the inline script in index.html puts on <html> while it reroutes. */
export const REROUTE_HIDE_CLASS = 'reroute-hide';

/**
 * Whether #root holds server markup for the page being shown.
 *
 * The prerender stamps each page's URL on #root. Markup for another URL (the
 * SPA fallback serving the English home for an unknown path, or the page a
 * returning visitor was just redirected away from) must be thrown away and
 * rendered fresh: hydrating it would be one long mismatch.
 */
export function shouldHydrate(prerenderedUrl: string | undefined, pathname: string): boolean {
  if (!prerenderedUrl) return false;
  return normalizePath(prerenderedUrl) === normalizePath(pathname);
}

/** Shows #root again once the app has rendered. Safe to call more than once. */
export function revealRoot(root: HTMLElement): void {
  root.classList.remove(REROUTE_HIDE_CLASS);
}
