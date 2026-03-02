import { fetcher } from '../http/fetcher';

export const patchesApi = {
  getPatches: (lang = 'en') =>
    fetcher(`/patches?lang=${lang}`),
};
