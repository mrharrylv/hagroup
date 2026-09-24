import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

/**
 * Stand-in for ./firebase.ts in the build-time prerender only (vite.config.ts
 * aliases it for the SSR build). Rendering a page never talks to Firebase:
 * the forms only write on submit, in the browser. Initialising the real app
 * in Node would be a side effect of rendering HTML, so nothing is set up here,
 * and any accidental use fails loudly.
 */
function unavailable(name: string): never {
  throw new Error(`Firebase ${name} is not available while prerendering`);
}

export const db = new Proxy({}, { get: () => unavailable('Firestore') }) as Firestore;
export const storage = new Proxy({}, { get: () => unavailable('Storage') }) as FirebaseStorage;
