// @vitest-environment happy-dom
import { act, startTransition, Suspense, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { lazyWithPreload, type PageModule, type PreloadablePage } from './lazyWithPreload';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Ready() {
  return <p>ready</p>;
}

const READY: PageModule = { default: Ready };

/** Server-renders the page inside a boundary, in one synchronous pass. */
function renderOnce(Page: PreloadablePage): string {
  return renderToString(
    <Suspense fallback={<p>waiting</p>}>
      <Page />
    </Suspense>,
  );
}

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
});

describe('lazyWithPreload', () => {
  it('suspends on its first render when it was not preloaded', () => {
    const Page = lazyWithPreload(() => Promise.resolve(READY));
    expect(renderOnce(Page)).toContain('waiting');
  });

  it('renders without suspending once preloaded', async () => {
    const Page = lazyWithPreload(() => Promise.resolve(READY));
    await Page.preload();
    const html = renderOnce(Page);
    expect(html).toContain('ready');
    expect(html).not.toContain('waiting');
  });

  it('fetches the module once, for the preload and every render', async () => {
    const load = vi.fn(() => Promise.resolve(READY));
    const Page = lazyWithPreload(load);
    await Promise.all([Page.preload(), Page.preload()]);
    renderOnce(Page);
    renderOnce(Page);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('tries the download again after it failed', async () => {
    const load = vi.fn<() => Promise<PageModule>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(READY);
    const Page = lazyWithPreload(load);

    await expect(Page.preload()).rejects.toThrow('offline');
    await Page.preload();

    expect(load).toHaveBeenCalledTimes(2);
    expect(renderOnce(Page)).toContain('ready');
  });

  it('keeps a page mounted through the renders after its module arrives', async () => {
    // A router navigation is a transition: the old page stays until the chunk
    // arrives. Later renders must not swap the element type under the mounted
    // page (lazy wrapper, then the loaded component), or React remounts it.
    const mounts = vi.fn();
    function Counted() {
      useEffect(() => mounts(), []);
      return <p>ready</p>;
    }
    let resolve: (module: PageModule) => void = () => undefined;
    const Page = lazyWithPreload(() => new Promise<PageModule>((done) => { resolve = done; }));
    const container = document.createElement('div');
    root = createRoot(container);
    const renderWith = (label: string, page: boolean) => root?.render(
      <Suspense fallback={<p>waiting</p>}>
        <span>{label}</span>
        {page && <Page />}
      </Suspense>,
    );

    act(() => renderWith('first', false));
    await act(async () => startTransition(() => renderWith('second', true)));
    expect(container.textContent).toBe('first');
    await act(async () => resolve({ default: Counted }));
    expect(container.textContent).toBe('secondready');

    act(() => renderWith('third', true));
    expect(container.textContent).toBe('thirdready');
    expect(mounts).toHaveBeenCalledTimes(1);
  });
});
