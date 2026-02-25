import { useQuery } from '@tanstack/react-query';
import { patchesApi } from '../api/patches';
import { queryKeys, STALE_5_MIN } from './keys';
import type { Patch } from '../types';

export const usePatchesQuery = () => {
  return useQuery({
    queryKey: queryKeys.patches.all,
    queryFn: async () => {
      const patches = await patchesApi.getPatches() as Patch[];
      // Sort patches by date (newest first)
      return patches.sort((a: Patch, b: Patch) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return dateB - dateA;
      });
    },
    staleTime: STALE_5_MIN,
  });
};


