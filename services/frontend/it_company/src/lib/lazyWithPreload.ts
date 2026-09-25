import { createElement, lazy, useState, type ComponentType, type ReactElement } from 'react';

/** What `import('./pages/X')` resolves to for a page. */
export interface PageModule {
  default: ComponentType;
}

/** A lazily loaded page whose code can be fetched before React first renders it. */
export interface PreloadablePage {
  (): ReactElement;
  /**
   * Fetches the page's module (once; a failure is tried again next time).
   * Once it resolves, the page renders without suspending.
   */
  preload(): Promise<void>;
}

/**
 * React.lazy plus preload(), after react-lazy-with-preload. A lazy component
 * suspends on its first render even when its module has already arrived, and
 * a prerendered Suspense boundary that suspends while hydrating stays
 * dehydrated: any router update that reaches it before the chunk does makes
 * React drop the server markup and show the fallback. main.tsx preloads the
 * page for the URL, so the boundary hydrates in its first pass.
 */
export function lazyWithPreload(load: () => Promise<PageModule>): PreloadablePage {
  let loaded: ComponentType | undefined;
  let pending: Promise<PageModule> | undefined;

  const loadOnce = (): Promise<PageModule> => {
    pending ??= load().then(
      (module) => {
        loaded = module.default;
        return module;
      },
      (error: unknown) => {
        pending = undefined;
        throw error;
      },
    );
    return pending;
  };

  const Lazy = lazy(loadOnce);

  function Page(): ReactElement {
    // Chosen once per mount, so the element type under a mounted page never
    // changes from Lazy to the loaded component, which would remount it.
    const [Component] = useState<ComponentType>(() => loaded ?? Lazy);
    return createElement(Component);
  }

  Page.preload = async (): Promise<void> => {
    await loadOnce();
  };
  return Page;
}
