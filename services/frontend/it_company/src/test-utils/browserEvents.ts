/**
 * Events dispatched the way a browser dispatches them, for happy-dom tests.
 * Tests only: nothing in the app imports this.
 */

function setWindowEvent(event: Event): void {
  Object.defineProperty(window, 'event', { value: event, configurable: true });
}

function clearWindowEvent(): void {
  Reflect.deleteProperty(window, 'event');
}

/**
 * Dispatches an event with window.event set while its listeners and the
 * microtasks they queue run. React reads it to rank updates made outside its
 * own handlers (a transition started during popstate is rendered at once),
 * and happy-dom does not set it.
 */
export async function dispatchAsBrowser(target: EventTarget, event: Event): Promise<void> {
  setWindowEvent(event);
  try {
    target.dispatchEvent(event);
    await Promise.resolve();
    await Promise.resolve();
  } finally {
    clearWindowEvent();
  }
}

type Phase = 'capture' | 'bubble';

function phaseOf(options?: boolean | EventListenerOptions): Phase {
  const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
  return capture ? 'capture' : 'bubble';
}

function invoke(target: EventTarget, listener: EventListenerOrEventListenerObject, event: Event): void {
  if (typeof listener === 'function') listener.call(target, event);
  else listener.handleEvent(event);
}

export interface BrowserDispatcher {
  /** Fires the event at the target and resolves once every listener and its microtasks have run. */
  fire(event: Event): Promise<void>;
  /** Puts the target's own addEventListener and removeEventListener back. */
  restore(): void;
}

/**
 * Makes `target` run its `type` listeners the way Chromium runs them for an
 * event it fires at window itself (popstate on Back or Forward): in the order
 * they were added, capture or not, each followed by the microtasks it queued,
 * and without one that an earlier listener removed or added. happy-dom runs
 * them back to back, capture listeners first, so React would only render
 * once all of them had run. Install it before the listeners are added.
 */
export function browserDispatcher(target: EventTarget, type: string): BrowserDispatcher {
  const add = target.addEventListener;
  const remove = target.removeEventListener;
  const wrappers = new Map<EventListenerOrEventListenerObject, Partial<Record<Phase, EventListener>>>();
  /** Listeners the current dispatch reached, with the order they were added in. */
  let reached: { order: number; run: () => void }[] = [];
  let added = 0;

  target.addEventListener = function patchedAdd(eventType, listener, options) {
    if (eventType !== type || listener === null) return add.call(this, eventType, listener, options);
    const phase = phaseOf(options);
    const own = wrappers.get(listener) ?? {};
    if (own[phase]) return;
    const order = ++added;
    const wrapper: EventListener = (event) => {
      reached.push({
        order,
        run: () => {
          if (wrappers.get(listener)?.[phase] === wrapper) invoke(target, listener, event);
        },
      });
    };
    wrappers.set(listener, { ...own, [phase]: wrapper });
    add.call(this, eventType, wrapper, options);
  };

  target.removeEventListener = function patchedRemove(eventType, listener, options) {
    if (eventType !== type || listener === null) return remove.call(this, eventType, listener, options);
    const phase = phaseOf(options);
    const wrapper = wrappers.get(listener)?.[phase];
    if (!wrapper) return;
    wrappers.set(listener, { ...wrappers.get(listener), [phase]: undefined });
    remove.call(this, eventType, wrapper, options);
  };

  return {
    async fire(event) {
      setWindowEvent(event);
      try {
        reached = [];
        target.dispatchEvent(event);
        const listeners = reached.sort((a, b) => a.order - b.order);
        for (const { run } of listeners) {
          run();
          // The microtask checkpoint after each listener.
          await Promise.resolve();
          await Promise.resolve();
        }
      } finally {
        clearWindowEvent();
      }
    },
    restore() {
      target.addEventListener = add;
      target.removeEventListener = remove;
    },
  };
}
