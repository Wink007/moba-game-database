import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {HomePage} from './pages/HomePage';
import HeroesPage from './pages/HeroesPage';
import HeroDetailPage from './pages/HeroDetailPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import EmblemsPage from './pages/EmblemsPage';
import SpellsPage from './pages/SpellsPage';
import { HeroRankPage } from './pages/HeroRankPage';
import { LegalPage } from './pages/LegalPage';
import { PatchesPage } from './pages/PatchesPage';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Footer } from './components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
              <Route path="/:gameId/items/:itemId" element={<ItemDetailPage />} />
              <Route path="/:gameId/emblems" element={<EmblemsPage />} />
              <Route path="/:gameId/battle-spells" element={<SpellsPage />} />
              <Route path="/:gameId/patches" element={<PatchesPage />} />
              <Route path="/:gameId/patches/:patchVersion" element={<PatchesPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
