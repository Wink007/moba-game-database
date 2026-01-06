import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useHeroes = (gameId?: number) => {
  return useQuery({
    queryKey: ['heroes', gameId],
    queryFn: () => api.getHeroes(gameId!),
    enabled: !!gameId // Запит тільки якщо є gameId
  });
};

export const useHero = (heroId?: number) => {
  return useQuery({
    queryKey: ['hero', heroId],
    queryFn: () => api.getHero(heroId!),
    enabled: !!heroId
  });
};


export const useHeroSkills = (selectedGameId?: number) => {
  return useQuery({
    queryKey: ['heroSkills', selectedGameId],
    queryFn: () => api.getSkills(selectedGameId!),
    enabled: !!selectedGameId
  });
};

export const useHeroSkillsById = (heroId?: number) => {
  return useQuery({
    queryKey: ['heroSkills', heroId],
    queryFn: () => api.getHeroSkills(heroId!),
    enabled: !!heroId
  });
};
export const useHeroRanks = (
  gameId?: number, 
  page?: number, 
  size?: number, 
  days?: number,
  rank?: string,
  sortField?: 'pick_rate' | 'ban_rate' | 'win_rate',
  sortOrder?: 'asc' | 'desc'
) => {
  return useQuery({
    queryKey: ['heroRanks', gameId, page, size, days, rank, sortField, sortOrder],
    queryFn: () => api.getHeroRanks(gameId!, page, size, days, rank, sortField, sortOrder),
    enabled: !!gameId
  });
};

export const useHeroRelations = (gameId?: number) => {
  return useQuery({
    queryKey: ['heroRelations', gameId],
    queryFn: () => api.getHeroRelations(gameId!),
    enabled: !!gameId
  });
};

export const useHeroCounterData = (gameId?: number) => {
  return useQuery({
    queryKey: ['heroCounterData', gameId],
    queryFn: () => api.getHeroCounterData(gameId!),
    enabled: !!gameId
  });
};

export const useHeroCompatibilityData = (gameId?: number) => {
  return useQuery({
    queryKey: ['heroCompatibilityData', gameId],
    queryFn: () => api.getHeroCompatibilityData(gameId!),
    enabled: !!gameId
  });
};

export const useHeroRank = (heroId?: number) => {
  return useQuery({
    queryKey: ['heroRank', heroId],
    queryFn: () => api.getHeroRank(heroId!),
    enabled: !!heroId
  });
};

export const useHeroRankHistory = (gameId?: number, heroGameId?: number) => {
  return useQuery({
    queryKey: ['heroRankHistory', gameId, heroGameId],
    queryFn: () => api.getHeroRankHistory(gameId!, heroGameId!),
    enabled: !!gameId && !!heroGameId
  });
};

// Patches - історія змін героїв
export const usePatches = () => {
  return useQuery({
    queryKey: ['patches'],
    queryFn: async () => {
      const patches = await api.getPatches();
      // Сортуємо патчі за датою (від новіших до старіших)
      return patches.sort((a: any, b: any) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return dateB - dateA;
      });
    },
  });
};
