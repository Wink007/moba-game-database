import { fetcher } from '../http/fetcher';

export const patchesApi = {
  getPatches: () => 
    fetcher('/patches'),
  
  getPatch: (version: string) => 
    fetcher(`/patches/${version}`),
};
