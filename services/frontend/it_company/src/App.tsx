import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WebsiteDevelopment from './pages/services/WebsiteDevelopment';
import SystemDevelopment from './pages/services/SystemDevelopment';
import ITInfrastructure from './pages/services/ITInfrastructure';
import FullCycle from './pages/services/FullCycle';
import DevOps from './pages/services/DevOps';
import CloudMigration from './pages/services/CloudMigration';
import AIIntegration from './pages/services/AIIntegration';
import Consulting from './pages/services/Consulting';
import ReviewsPage from './pages/ReviewsPage';
import ProjectsPage from './pages/ProjectsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import ServicesPage from './pages/ServicesPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';
import ProjectPage from './pages/projects/ProjectPage';

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/company-details" element={<CompanyDetailsPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/cookies" element={<CookiePolicyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
