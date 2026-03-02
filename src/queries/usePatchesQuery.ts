import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { patchesApi } from '../api/patches';
import { queryKeys, STALE_5_MIN } from './keys';
import type { Patch } from '../types';

export const usePatchesQuery = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'uk' ? 'uk' : 'en';

  return useQuery({
    queryKey: queryKeys.patches.all(lang),
    queryFn: async () => {
      const patches = await patchesApi.getPatches(lang) as Patch[];
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


