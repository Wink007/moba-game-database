import { fetcher } from '../http/fetcher';
import type { Game } from '../../types';

export const gamesApi = {
  getGames: (): Promise<Game[]> => fetcher('/games'),
};
