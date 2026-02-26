import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { Loader } from './components/Loader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setQueryClientRef } from './store/authStore';
import { STALE_5_MIN } from './queries/keys';
import './App.css';

const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const HeroesPage = React.lazy(() => import('./pages/HeroesPage'));
const HeroDetailPage = React.lazy(() => import('./pages/HeroDetailPage'));
const ItemsPage = React.lazy(() => import('./pages/ItemsPage'));
const EmblemsPage = React.lazy(() => import('./pages/EmblemsPage'));
const SpellsPage = React.lazy(() => import('./pages/SpellsPage'));
const HeroRankPage = React.lazy(() => import('./pages/HeroRankPage').then(m => ({ default: m.HeroRankPage })));
const LegalPage = React.lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));
const PatchesPage = React.lazy(() => import('./pages/PatchesPage').then(m => ({ default: m.PatchesPage })));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const CounterPickPage = React.lazy(() => import('./pages/CounterPickPage').then(m => ({ default: m.CounterPickPage })));
const TierListPage = React.lazy(() => import('./pages/TierListPage').then(m => ({ default: m.TierListPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_5_MIN,
      retry: 2,
    },
  },
});
setQueryClientRef(queryClient);
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
            <main className="main-content">
              <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<RouteErrorBoundary><HomePage /></RouteErrorBoundary>} />
                <Route path="/legal" element={<RouteErrorBoundary><LegalPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/heroes" element={<RouteErrorBoundary><HeroesPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/heroes/:heroId" element={<RouteErrorBoundary><HeroDetailPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/hero-ranks" element={<RouteErrorBoundary><HeroRankPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/items" element={<RouteErrorBoundary><ItemsPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/items/:itemId" element={<RouteErrorBoundary><ItemsPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/emblems" element={<RouteErrorBoundary><EmblemsPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/spells" element={<RouteErrorBoundary><SpellsPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/patches" element={<RouteErrorBoundary><PatchesPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/patches/:patchVersion" element={<RouteErrorBoundary><PatchesPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/counter-pick" element={<RouteErrorBoundary><CounterPickPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/tier-list" element={<RouteErrorBoundary><TierListPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/favorites" element={<RouteErrorBoundary><FavoritesPage /></RouteErrorBoundary>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </Suspense>
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
