import { API_URL } from '../config';
import type { Game, GameStats, Hero, HeroSkill, Item } from '../types';
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
  getHeroRanks: (gameId: number, page?: number, size?: number, days?: number): Promise<HeroRank[]> => {
    let url = `/hero-ranks?game_id=${gameId}`;
    if (page && size) {
      url += `&page=${page}&size=${size}`;
    }
    if (days) {
      url += `&days=${days}`;
    }
    return fetchApi(url);
  },
  getHeroRank: (heroId: number): Promise<HeroRank> => fetchApi(`/heroes/${heroId}/rank`),
};
