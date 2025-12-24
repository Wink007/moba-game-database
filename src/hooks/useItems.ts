import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useItems = (gameId: number | null) => {
  return useQuery({
    queryKey: ['items', gameId],
    queryFn: () => gameId ? api.getItems(gameId) : Promise.resolve([]),
    enabled: !!gameId
  });
};
