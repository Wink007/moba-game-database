import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { HeroRank } from '../../types/heroRank';
import type { ChartDataPoint } from './types';

export const useHeroStats = (gameId: number | null) => {
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);

  // Запит списку героїв
  const { data: heroRanks } = useQuery({
    queryKey: ['heroRanks', gameId, 'glory'],
    queryFn: () => api.getHeroRanks(gameId!, 1, 100, undefined, 'glory'),
    enabled: !!gameId,
  });

  // Запити статистики за різні періоди
  const query1Day = useQuery({
    queryKey: ['heroRanks', gameId, 1, 'glory'],
    queryFn: () => api.getHeroRanks(gameId!, 1, 200, 1, 'glory'),
    enabled: !!gameId,
  });

  const query3Days = useQuery({
    queryKey: ['heroRanks', gameId, 3, 'glory'],
    queryFn: () => api.getHeroRanks(gameId!, 1, 200, 3, 'glory'),
    enabled: !!gameId,
  });

  const query7Days = useQuery({
    queryKey: ['heroRanks', gameId, 7, 'glory'],
    queryFn: () => api.getHeroRanks(gameId!, 1, 200, 7, 'glory'),
    enabled: !!gameId,
  });

  const query15Days = useQuery({
    queryKey: ['heroRanks', gameId, 15, 'glory'],
    queryFn: () => api.getHeroRanks(gameId!, 1, 200, 15, 'glory'),
    enabled: !!gameId,
  });

  const query30Days = useQuery({
    queryKey: ['heroRanks', gameId, 30, 'glory'],
    queryFn: () => api.getHeroRanks(gameId!, 1, 200, 30, 'glory'),
    enabled: !!gameId,
  });

  const stats1Day = query1Day.data;
  const stats3Days = query3Days.data;
  const stats7Days = query7Days.data;
  const stats15Days = query15Days.data;
  const stats30Days = query30Days.data;

  const isLoading = query1Day.isLoading || query3Days.isLoading || query7Days.isLoading || 
                    query15Days.isLoading || query30Days.isLoading;
  const isError = query1Day.isError || query3Days.isError || query7Days.isError || 
                  query15Days.isError || query30Days.isError;

  // Вибираємо рандомного героя
  useEffect(() => {
    if (heroRanks?.length && !selectedHeroId) {
      const randomHero = heroRanks[Math.floor(Math.random() * heroRanks.length)];
      setSelectedHeroId(randomHero.hero_id);
    }
  }, [heroRanks, selectedHeroId]);

  // Знаходимо дані героя
  const findHeroData = (stats: HeroRank[] | undefined) => 
    stats?.find(h => h.hero_id === selectedHeroId);

  const hero1Day = findHeroData(stats1Day);
  const hero3Days = findHeroData(stats3Days);
  const hero7Days = findHeroData(stats7Days);
  const hero15Days = findHeroData(stats15Days);
  const hero30Days = findHeroData(stats30Days);

  // Перевірка чи всі дані завантажені
  const hasAllData = hero1Day && hero3Days && hero7Days && hero15Days && hero30Days;

  if (!hasAllData) {
    return { isLoading: isLoading || !selectedHeroId, isError, hero: null, data: null };
  }

  // Формуємо дані для графіків
  const winRateData: ChartDataPoint[] = [
    { patch: '30d', value: hero30Days.win_rate },
    { patch: '15d', value: hero15Days.win_rate },
    { patch: '7d', value: hero7Days.win_rate },
    { patch: '3d', value: hero3Days.win_rate },
    { patch: '1d', value: hero1Day.win_rate },
  ];

  const banRateData: ChartDataPoint[] = [
    { patch: '30d', value: hero30Days.ban_rate },
    { patch: '15d', value: hero15Days.ban_rate },
    { patch: '7d', value: hero7Days.ban_rate },
    { patch: '3d', value: hero3Days.ban_rate },
    { patch: '1d', value: hero1Day.ban_rate },
  ];

  const winRateTrend = (hero1Day.win_rate - hero3Days.win_rate) * 100;
  const banRateTrend = (hero1Day.ban_rate - hero3Days.ban_rate) * 100;

  return {
    isLoading,
    isError,
    hero: hero1Day,
    data: {
      winRate: { data: winRateData, trend: winRateTrend },
      banRate: { data: banRateData, trend: banRateTrend },
    },
  };
};
