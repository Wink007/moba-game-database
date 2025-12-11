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
export const useHeroRanks = (gameId?: number) => {
  return useQuery({
    queryKey: ['heroRanks', gameId],
    queryFn: () => api.getHeroRanks(gameId!),
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
