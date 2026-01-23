import { fetcher } from '../http/fetcher';
import type { Game, GameStats } from '../../types';

export const gamesApi = {
  getGames: (): Promise<Game[]> => fetcher('/games'),
  getGame: (id: number): Promise<Game> => fetcher(`/games/${id}`),
  getGameStats: (id: number): Promise<GameStats> => fetcher(`/games/${id}/stats`),
};
