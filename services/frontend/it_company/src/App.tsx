import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';

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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-zinc-950" aria-live="polite" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/website-development" element={<WebsiteDevelopment />} />
            <Route path="/services/system-development" element={<SystemDevelopment />} />
            <Route path="/services/it-infrastructure" element={<ITInfrastructure />} />
            <Route path="/services/full-cycle" element={<FullCycle />} />
            <Route path="/services/devops" element={<DevOps />} />
            <Route path="/services/cloud-migration" element={<CloudMigration />} />
            <Route path="/services/ai-integration" element={<AIIntegration />} />
            <Route path="/services/consulting" element={<Consulting />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/balticgp" element={<BalticGPPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/company-details" element={<CompanyDetailsPage />} />
            <Route path="/legal/terms" element={<TermsPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
            <Route path="/legal/cookies" element={<CookiePolicyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
