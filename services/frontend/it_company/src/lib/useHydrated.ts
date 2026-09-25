import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  // Nothing to listen to: the value changes once, after hydration.
  return () => undefined;
}

const onClient = (): boolean => true;
const onServer = (): boolean => false;

/**
 * False on the server and while React hydrates the prerendered markup, true
 * from the render right after (and from the first render of a page that was
 * not prerendered). For values the prerender cannot know, such as the
 * visitor's ?query and #hash: React 19 keeps the server's attribute when a
 * hydrated one differs, so such a value has to match the server first and
 * change after.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
