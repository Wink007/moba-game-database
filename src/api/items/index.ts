import { fetcher } from '../http/fetcher';
import type { Item } from '../../types';

export const itemsApi = {
  getItems: (gameId: number): Promise<Item[]> => 
    fetcher(`/items?game_id=${gameId}`),
  
  getItem: (id: number): Promise<Item> => 
    fetcher(`/items/${id}`),
  
  searchItems: (gameId: number, query: string): Promise<Item[]> => 
    fetcher(`/search/items?game_id=${gameId}&query=${query}`),
};
