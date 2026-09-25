import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const WebsiteDevelopment = lazy(() => import('./pages/services/WebsiteDevelopment'));
const SystemDevelopment = lazy(() => import('./pages/services/SystemDevelopment'));
const ITInfrastructure = lazy(() => import('./pages/services/ITInfrastructure'));
const FullCycle = lazy(() => import('./pages/services/FullCycle'));
const DevOps = lazy(() => import('./pages/services/DevOps'));
const CloudMigration = lazy(() => import('./pages/services/CloudMigration'));
const AIIntegration = lazy(() => import('./pages/services/AIIntegration'));
const Consulting = lazy(() => import('./pages/services/Consulting'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const CookiePolicyPage = lazy(() => import('./pages/legal/CookiePolicyPage'));
const ProjectPage = lazy(() => import('./pages/projects/ProjectPage'));
const BalticGPPage = lazy(() => import('./pages/projects/BalticGPPage'));

/**
 * The page tree, shared by the browser (BrowserRouter, main.tsx) and the
 * build-time prerender (StaticRouter, entry-server.tsx). Paths are unprefixed:
 * the router's basename carries /lv or /ru. Keep in step with src/seo/routes.ts.
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
          <Route caseSensitive path="/" element={<HomePage />} />
          <Route caseSensitive path="/services" element={<ServicesPage />} />
          <Route caseSensitive path="/services/website-development" element={<WebsiteDevelopment />} />
          <Route caseSensitive path="/services/system-development" element={<SystemDevelopment />} />
          <Route caseSensitive path="/services/it-infrastructure" element={<ITInfrastructure />} />
          <Route caseSensitive path="/services/full-cycle" element={<FullCycle />} />
          <Route caseSensitive path="/services/devops" element={<DevOps />} />
          <Route caseSensitive path="/services/cloud-migration" element={<CloudMigration />} />
          <Route caseSensitive path="/services/ai-integration" element={<AIIntegration />} />
          <Route caseSensitive path="/services/consulting" element={<Consulting />} />
          <Route caseSensitive path="/reviews" element={<ReviewsPage />} />
          <Route caseSensitive path="/projects" element={<ProjectsPage />} />
          <Route caseSensitive path="/projects/:slug" element={<ProjectPage />} />
          <Route caseSensitive path="/balticgp" element={<BalticGPPage />} />
          <Route caseSensitive path="/careers" element={<CareersPage />} />
          <Route caseSensitive path="/contact" element={<ContactPage />} />
          <Route caseSensitive path="/about" element={<AboutPage />} />
          <Route caseSensitive path="/company-details" element={<CompanyDetailsPage />} />
          <Route caseSensitive path="/legal/terms" element={<TermsPage />} />
          <Route caseSensitive path="/legal/privacy" element={<PrivacyPage />} />
          <Route caseSensitive path="/legal/cookies" element={<CookiePolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
