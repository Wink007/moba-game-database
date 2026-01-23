import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { queryKeys } from './keys';

export const useItemsQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.items.all(gameId),
    queryFn: () => itemsApi.getItems(gameId),
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useItemQuery = (id: number) => {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => itemsApi.getItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
