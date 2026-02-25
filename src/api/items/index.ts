import { fetcher } from '../http/fetcher';
import type { Item } from '../../types';

export const itemsApi = {
  getItems: (gameId: number): Promise<Item[]> => 
    fetcher(`/items?game_id=${gameId}`),
};
