import { API_URL } from '../config';
import type { Game, GameStats, Hero, HeroSkill, Item, HeroRelation, HeroCounterData, HeroCompatibilityData } from '../types';
import type { HeroRank } from '../types/heroRank';

export const fetchApi = async (endpoint: string) => {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  return data.data || data;
};

export const api = {
  // Games
  getGames: (): Promise<Game[]> => fetchApi('/games'),
  getGame: (id: number): Promise<Game> => fetchApi(`/games/${id}`),
  getGameStats: (id: number): Promise<GameStats> => fetchApi(`/games/${id}/stats`),
  
  // Heroes
  getHeroes: (gameId: number): Promise<Hero[]> => fetchApi(`/heroes?game_id=${gameId}`),
  getHero: (id: number): Promise<Hero> => fetchApi(`/heroes/${id}`),
  getSkills: (gameId: number): Promise<HeroSkill[]> => fetchApi(`/heroes/skills?game_id=${gameId}`),
  getHeroSkills: (heroId: number): Promise<HeroSkill[]> => fetchApi(`/heroes/${heroId}/skills`),
  
  // Items
  getItems: (gameId: number): Promise<Item[]> => fetchApi(`/items?game_id=${gameId}`),
  getItem: (id: number): Promise<Item> => fetchApi(`/items/${id}`),
  searchItems: (gameId: number, query: string): Promise<Item[]> => 
    fetchApi(`/search/items?game_id=${gameId}&query=${query}`),
  
  // Hero Ranks
  getHeroRanks: (
    gameId: number, 
    page?: number, 
    size?: number, 
    days?: number,
    rank?: string,
    sortField?: 'pick_rate' | 'ban_rate' | 'win_rate',
    sortOrder?: 'asc' | 'desc'
  ): Promise<HeroRank[]> => {
    let url = `/hero-ranks?game_id=${gameId}`;
    if (page && size) {
      url += `&page=${page}&size=${size}`;
    }
    if (days) {
      url += `&days=${days}`;
    }
    if (rank) {
      url += `&rank=${rank}`;
    }
    if (sortField) {
      url += `&sort_field=${sortField}`;
    }
    if (sortOrder) {
      url += `&sort_order=${sortOrder}`;
    }
    return fetchApi(url);
  },
  getHeroRank: (heroId: number): Promise<HeroRank> => fetchApi(`/heroes/${heroId}/rank`),
  
  // Hero Rank History - отримати статистику за різні періоди
  getHeroRankHistory: async (gameId: number, heroGameId: number): Promise<HeroRank[]> => {
    const periods = [1, 3, 7, 15, 30];
    const results = await Promise.all(
      periods.map(days => 
        fetch(`${API_URL}/hero-ranks?game_id=${gameId}&days=${days}`)
          .then(res => res.json())
          .then(data => data.data || data)
      )
    );
    
    // Фільтруємо для конкретного героя
    return periods.map((days, idx) => {
      const ranks = results[idx] as HeroRank[];
      const heroRank = ranks.find(r => r.hero_game_id === heroGameId || r.hero_id === heroGameId);
      if (!heroRank) return null;
      return { ...heroRank, days };
    }).filter((r): r is HeroRank => r !== null && r.win_rate !== undefined);
  },
  
  // Hero Relations
  getHeroRelations: (gameId: number): Promise<Record<number, HeroRelation>> => 
    fetchApi(`/heroes/relations?game_id=${gameId}`),
  
  // Hero Counter Data
  getHeroCounterData: (gameId: number): Promise<Record<number, HeroCounterData>> => 
    fetchApi(`/heroes/counter-data?game_id=${gameId}`),
  
  // Hero Compatibility Data
  getHeroCompatibilityData: (gameId: number): Promise<Record<number, HeroCompatibilityData>> => 
    fetchApi(`/heroes/compatibility-data?game_id=${gameId}`),
  
  // Patches - історія змін
  getPatches: (): Promise<any[]> => fetchApi('/patches'),
};
