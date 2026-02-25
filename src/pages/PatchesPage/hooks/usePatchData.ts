import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetcherRaw } from '../../../api/http/fetcher';
import { queryKeys, STALE_5_MIN } from '../../../queries/keys';
import { useHeroesQuery } from '../../../queries/useHeroesQuery';
import { useItemsQuery } from '../../../queries/useItemsQuery';
import { Patch, PatchVersion } from '../types';
import type { Hero, Item } from '../../../types';

interface UsePatchDataProps {
  gameId: string | undefined;
  patchVersion: string | undefined;
}

interface UsePatchDataReturn {
  patchVersions: PatchVersion[];
  currentPatchData: Patch | null;
  loading: boolean;
  loadingPatch: boolean;
  selectedPatch: string | null;
  heroNameToId: Record<string, number>;
  itemNameToId: Record<string, number>;
  handlePatchSelect: (version: string) => void;
}

export const usePatchData = ({ gameId, patchVersion }: UsePatchDataProps): UsePatchDataReturn => {
  const navigate = useNavigate();

  // Fetch minimal patch list via React Query
  const { data: patchVersions = [], isLoading: loadingVersions } = useQuery<PatchVersion[]>({
    queryKey: queryKeys.patches.minimal,
    queryFn: () => fetcherRaw<PatchVersion[]>('/patches?minimal=true&limit=50'),
    staleTime: STALE_5_MIN,
  });

  // Determine which version to show
  const versionFromUrl = patchVersion ? patchVersion.replace('patch_', '') : null;
  const resolvedVersion = useMemo(() => {
    if (!patchVersions.length) return null;
    if (versionFromUrl && patchVersions.find(p => p.version === versionFromUrl)) {
      return versionFromUrl;
    }
    return patchVersions[0]?.version ?? null;
  }, [patchVersions, versionFromUrl]);

  // Redirect if URL doesn't match resolved version
  useEffect(() => {
    if (resolvedVersion && resolvedVersion !== versionFromUrl) {
      navigate(`/${gameId}/patches/patch_${resolvedVersion}`, { replace: true });
    }
  }, [resolvedVersion, versionFromUrl, gameId, navigate]);

  // Fetch full patch data
  const { data: currentPatchData = null, isLoading: loadingPatch } = useQuery<Patch>({
    queryKey: queryKeys.patches.detail(resolvedVersion || ''),
    queryFn: () => fetcherRaw<Patch>(`/patches/${resolvedVersion}`),
    enabled: !!resolvedVersion,
    staleTime: STALE_5_MIN,
  });

  // Use existing queries for hero/item name mapping (game_id=2 = MLBB)
  const numericGameId = Number(gameId) || 2;
  const { data: heroes = [] } = useHeroesQuery(numericGameId);
  const { data: items = [] } = useItemsQuery(numericGameId);

  const heroNameToId = useMemo(() => {
    const map: Record<string, number> = {};
    heroes.forEach((hero: Hero) => { map[hero.name] = hero.id; });
    return map;
  }, [heroes]);

  const itemNameToId = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item: Item) => { map[item.name] = item.id; });
    return map;
  }, [items]);

  const handlePatchSelect = useCallback((version: string) => {
    navigate(`/${gameId}/patches/patch_${version}`, { replace: true });
  }, [gameId, navigate]);

  return {
    patchVersions,
    currentPatchData,
    loading: loadingVersions,
    loadingPatch,
    selectedPatch: resolvedVersion,
    heroNameToId,
    itemNameToId,
    handlePatchSelect,
  };
};
