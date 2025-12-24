import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: api.getGames
  });
};