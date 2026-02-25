import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { queryKeys, STALE_5_MIN } from './keys';

export const useItemsQuery = (gameId: number) => {
  return useQuery({
    queryKey: queryKeys.items.all(gameId),
    queryFn: () => itemsApi.getItems(gameId),
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
  });
};


