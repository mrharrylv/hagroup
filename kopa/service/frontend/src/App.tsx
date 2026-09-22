import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'));
const CreateCampaignPage = lazy(() => import('./pages/CreateCampaignPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:slug" element={<CampaignDetailPage />} />
        <Route path="start" element={<CreateCampaignPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="demo" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
