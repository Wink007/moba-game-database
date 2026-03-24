import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { AnimatedSplash } from './components/AnimatedSplash';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { Loader } from './components/Loader';
import { RemoveAdsModal } from './components/RemoveAdsModal';
import { CookieConsent } from './components/CookieConsent';
import { AdBannerSpacer } from './components/AdBannerSpacer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setQueryClientRef } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useAdManager } from './hooks/useAdManager';
import { useInterstitialAd } from './hooks/useInterstitialAd';
import { checkAndStartFlexibleUpdate } from './services/appUpdateService';
import { STALE_5_MIN } from './queries/keys';
import { FF_SOCIAL, FF_PLAYERS } from './config';
import './App.css';

// Модульна змінна — не скидається при ремаунті App
let _splashDone = !Capacitor.isNativePlatform();

// webpackPreload: завантажується паралельно з головним бандлом
const HomePage = React.lazy(() => import(/* webpackPreload: true */ './pages/HomePage').then(m => ({ default: m.HomePage })));
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
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PlayersPage = React.lazy(() => import('./pages/PlayersPage').then(m => ({ default: m.PlayersPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_5_MIN,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx/5xx server errors — only on network failures
        const status = error?.status ?? error?.response?.status;
        if (status && status >= 400) return false;
        return failureCount < 2;
      },
    },
  },
});
setQueryClientRef(queryClient);

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '298925088925-a5l28snnss99vm5hskqnh644nopu85pl.apps.googleusercontent.com';

function AppInner() {
  useAdManager();
  useInterstitialAd();
  // Initialize theme store (applies saved theme + listens for system pref changes)
  useThemeStore();

  useEffect(() => {
    checkAndStartFlexibleUpdate();
  }, []);
  return (
    <>
    <RemoveAdsModal />
    </>  
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(() => _splashDone);
  const [refreshKey, setRefreshKey] = useState(0);

  // Native pull-to-refresh: clear cache + remount page components
  useEffect(() => {
    (window as any).__onPullToRefresh = () => {
      queryClient.clear();
      setRefreshKey(k => k + 1);
    };
  }, []);

  return (
    <>
    {!splashDone && <AnimatedSplash onDone={() => { _splashDone = true; setSplashDone(true); }} />}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <AppInner />
          <CookieConsent />
          <div className="banner-cover" aria-hidden="true" />
          <div className="app-wrapper">
            <AdBannerSpacer />
            <Header />
            <main className="main-content">
              <Suspense key={refreshKey} fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<RouteErrorBoundary><HomePage /></RouteErrorBoundary>} />
                <Route path="/legal" element={<RouteErrorBoundary><LegalPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/heroes" element={<RouteErrorBoundary><HeroesPage /></RouteErrorBoundary>} />
                <Route path="/:gameId/heroes/:heroSlug" element={<RouteErrorBoundary><HeroDetailPage /></RouteErrorBoundary>} />
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
                <Route path="/settings" element={<RouteErrorBoundary><SettingsPage /></RouteErrorBoundary>} />
                {FF_SOCIAL && <Route path="/profile/:userId" element={<RouteErrorBoundary><ProfilePage /></RouteErrorBoundary>} />}
                {FF_PLAYERS && <Route path="/players" element={<RouteErrorBoundary><PlayersPage /></RouteErrorBoundary>} />}
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
    </>
  );
}

export default App;
