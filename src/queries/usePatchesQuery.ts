import { useQuery } from '@tanstack/react-query';
import { patchesApi } from '../api/patches';
import { queryKeys } from './keys';

export const usePatchesQuery = () => {
  return useQuery({
    queryKey: queryKeys.patches.all,
    queryFn: async () => {
      const patches = await patchesApi.getPatches() as any[];
      // Sort patches by date (newest first)
      return patches.sort((a: any, b: any) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return dateB - dateA;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePatchQuery = (version: string) => {
  return useQuery({
    queryKey: queryKeys.patches.detail(version),
    queryFn: () => patchesApi.getPatch(version),
    staleTime: 5 * 60 * 1000,
    enabled: !!version,
  });
};
