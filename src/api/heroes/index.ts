import { fetcher } from '../http/fetcher';
import { fetcherRaw } from '../http/fetcher';
import type { Hero, HeroSkill, HeroCounterData, HeroCompatibilityData, HeroRank, PaginatedHeroesResponse } from '../../types';

export interface HeroesFilterParams {
  page: number;
  size?: number;
  role?: string;
  lane?: string;
  search?: string;
  complexity?: string;
  sort?: string;
  favorite_ids?: number[];
}

export const heroesApi = {
  getHeroes: (gameId: number): Promise<Hero[]> => 
    fetcher(`/heroes?game_id=${gameId}`),

  getHeroesPaginated: (gameId: number, params: HeroesFilterParams): Promise<PaginatedHeroesResponse> => {
    const qs = new URLSearchParams();
    qs.append('game_id', gameId.toString());
    qs.append('page', params.page.toString());
    if (params.size) qs.append('size', params.size.toString());
    if (params.role) qs.append('role', params.role);
    if (params.lane) qs.append('lane', params.lane);
    if (params.search) qs.append('search', params.search);
    if (params.complexity) qs.append('complexity', params.complexity);
    if (params.sort) qs.append('sort', params.sort);
    if (params.favorite_ids && params.favorite_ids.length > 0) qs.append('favorite_ids', params.favorite_ids.join(','));
    return fetcherRaw(`/heroes?${qs.toString()}`);
  },
  
  getHero: (id: number): Promise<Hero> => 
    fetcher(`/heroes/${id}`),
  
  getHeroSkills: (heroId: number): Promise<HeroSkill[]> => 
    fetcher(`/heroes/${heroId}/skills`),
  
  getHeroCounterData: (gameId: number): Promise<Record<number, HeroCounterData>> => 
    fetcher(`/heroes/counter-data?game_id=${gameId}`),
  
  getHeroCompatibilityData: (gameId: number): Promise<Record<number, HeroCompatibilityData>> => 
    fetcher(`/heroes/compatibility-data?game_id=${gameId}`),

  getHeroRanks: (
    gameId: number,
    page?: number,
    size?: number,
    days?: number,
    rank?: string,
    sortField?: 'pick_rate' | 'ban_rate' | 'win_rate',
    sortOrder?: 'asc' | 'desc'
  ): Promise<HeroRank[]> => {
    const params = new URLSearchParams();
    params.append('game_id', gameId.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    if (days !== undefined) params.append('days', days.toString());
    if (rank) params.append('rank', rank);
    if (sortField) params.append('sort_field', sortField);
    if (sortOrder) params.append('sort_order', sortOrder);
    return fetcher(`/hero-ranks?${params.toString()}`);
  },

};

