import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {HomePage} from './pages/HomePage';
import HeroesPage from './pages/HeroesPage';
import HeroDetailPage from './pages/HeroDetailPage';
import ItemsPage from './pages/ItemsPage';
import EmblemsPage from './pages/EmblemsPage';
import SpellsPage from './pages/SpellsPage';
import { HeroRankPage } from './pages/HeroRankPage';
import { LegalPage } from './pages/LegalPage';
import { PatchesPage } from './pages/PatchesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '298925088925-a5l28snnss99vm5hskqnh644nopu85pl.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <div className="app-wrapper">
            <Header />
            <Breadcrumbs />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/:gameId/heroes" element={<HeroesPage />} />
                <Route path="/:gameId/heroes/:heroId" element={<HeroDetailPage />} />
                <Route path="/:gameId/hero-ranks" element={<HeroRankPage />} />
                <Route path="/:gameId/items" element={<ItemsPage />} />
                <Route path="/:gameId/items/:itemId" element={<ItemsPage />} />
                <Route path="/:gameId/emblems" element={<EmblemsPage />} />
                <Route path="/:gameId/spells" element={<SpellsPage />} />
                <Route path="/:gameId/patches" element={<PatchesPage />} />
                <Route path="/:gameId/patches/:patchVersion" element={<PatchesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
