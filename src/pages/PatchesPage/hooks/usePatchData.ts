import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patch, PatchVersion } from '../types';

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
  handlePatchSelect: (version: string) => Promise<void>;
}

export const usePatchData = ({ gameId, patchVersion }: UsePatchDataProps): UsePatchDataReturn => {
  const navigate = useNavigate();
  const [patchVersions, setPatchVersions] = useState<PatchVersion[]>([]);
  const [currentPatchData, setCurrentPatchData] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPatch, setLoadingPatch] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [heroNameToId, setHeroNameToId] = useState<Record<string, number>>({});
  const [itemNameToId, setItemNameToId] = useState<Record<string, number>>({});

  const handlePatchSelect = async (version: string) => {
    setSelectedPatch(version);
    navigate(`/${gameId}/patches/patch_${version}`, { replace: true });
    
    setLoadingPatch(true);
    try {
      const response = await fetch(`https://web-production-8570.up.railway.app/api/patches/${version}`);
      const patchData = await response.json();
      setCurrentPatchData(patchData);
    } catch (error) {
      console.error('Error fetching patch data:', error);
    } finally {
      setLoadingPatch(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patch versions list
        const patchesResponse = await fetch(`https://web-production-8570.up.railway.app/api/patches?minimal=true&limit=50`);
        const patchesData = await patchesResponse.json();
        setPatchVersions(patchesData);
        
        if (patchesData.length > 0) {
          const versionFromUrl = patchVersion ? patchVersion.replace('patch_', '') : null;
          const patchToSelect = versionFromUrl && patchesData.find((p: any) => p.version === versionFromUrl)
            ? versionFromUrl
            : patchesData[0].version;
          
          if (!patchVersion) {
            navigate(`/${gameId}/patches/patch_${patchToSelect}`, { replace: true });
          }
          
          const selectedPatchResponse = await fetch(`https://web-production-8570.up.railway.app/api/patches/${patchToSelect}`);
          const selectedPatchData = await selectedPatchResponse.json();
          setCurrentPatchData(selectedPatchData);
          setSelectedPatch(patchToSelect);
        }

        // Fetch heroes mapping
        const heroesResponse = await fetch(`https://web-production-8570.up.railway.app/api/heroes?game_id=2`);
        const heroesData = await heroesResponse.json();
        const heroMapping: Record<string, number> = {};
        heroesData.forEach((hero: any) => {
          heroMapping[hero.name] = hero.id;
        });
        setHeroNameToId(heroMapping);

        // Fetch items mapping
        const itemsResponse = await fetch(`https://web-production-8570.up.railway.app/api/items?game_id=2`);
        const itemsData = await itemsResponse.json();
        const itemMapping: Record<string, number> = {};
        itemsData.forEach((item: any) => {
          itemMapping[item.name] = item.id;
        });
        setItemNameToId(itemMapping);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameId, patchVersion, navigate]);

  return {
    patchVersions,
    currentPatchData,
    loading,
    loadingPatch,
    selectedPatch,
    heroNameToId,
    itemNameToId,
    handlePatchSelect,
  };
};
