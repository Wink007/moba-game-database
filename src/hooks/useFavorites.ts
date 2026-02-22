import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, authFetch } from '../store/authStore';

interface Favorite {
  id: number;
  hero_id: number;
  created_at: string;
  name?: string;
  image?: string;
}

/**
 * Shared favorites hook — loads favorites ONCE and shares across all components.
 * Uses react-query for caching, deduplication, and automatic refetch.
 */
export const useFavorites = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: () => authFetch('/favorites'),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  const isFavorite = useCallback(
    (heroId: number) => favorites.some((f) => f.hero_id === heroId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (heroId: number) => {
      const currentlyFavorite = favorites.some((f) => f.hero_id === heroId);

      // Optimistic update
      queryClient.setQueryData<Favorite[]>(['favorites'], (old = []) =>
        currentlyFavorite
          ? old.filter((f) => f.hero_id !== heroId)
          : [...old, { id: Date.now(), hero_id: heroId, created_at: new Date().toISOString() }]
      );

      try {
        if (currentlyFavorite) {
          await authFetch(`/favorites/${heroId}`, { method: 'DELETE' });
        } else {
          await authFetch(`/favorites/${heroId}`, { method: 'POST' });
        }
        // Refetch to sync with server
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      } catch (err) {
        // Rollback optimistic update
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
        throw err;
      }
    },
    [favorites, queryClient]
  );

  const addFavorite = useCallback(
    async (heroId: number) => {
      // Optimistic update
      queryClient.setQueryData<Favorite[]>(['favorites'], (old = []) => [
        ...old,
        { id: Date.now(), hero_id: heroId, created_at: new Date().toISOString() },
      ]);

      try {
        await authFetch(`/favorites/${heroId}`, { method: 'POST' });
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      } catch (err) {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
        throw err;
      }
    },
    [queryClient]
  );

  return { favorites, isLoading, isFavorite, toggleFavorite, addFavorite };
};
