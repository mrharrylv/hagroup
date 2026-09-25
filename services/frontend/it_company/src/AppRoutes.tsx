import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import NotFoundPage from './pages/NotFoundPage';
import { PAGE_ROUTES } from './pageRoutes';

/**
 * The page tree, shared by the browser (BrowserRouter, main.tsx) and the
 * build-time prerender (StaticRouter, entry-server.tsx). The pages and their
 * paths are listed in src/pageRoutes.ts. Paths are unprefixed: the router's
 * basename carries /lv or /ru.
 *
 * Every path is case-sensitive, like src/seo/routes.ts and the S3 keys: the
 * router's default would render /Services/DevOps as the DevOps page under the
 * not-found head.
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" aria-live="polite" />}>
      <Routes>
        <Route element={<Layout />}>
          {PAGE_ROUTES.map(({ path, Page }) => (
            <Route key={path} caseSensitive path={path} element={<Page />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
