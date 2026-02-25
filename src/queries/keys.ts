/** Default stale time for all queries (5 minutes) */
export const STALE_5_MIN = 5 * 60 * 1000;

export const queryKeys = {
  games: {
    all: ['games'] as const,
  },
  heroes: {
    all: (gameId: number) => ['heroes', { gameId }] as const,
    paginated: (gameId: number, filters?: Record<string, any>) =>
      ['heroes', 'paginated', { gameId, ...filters }] as const,
    detail: (id: number) => ['heroes', id] as const,
    skills: (heroId: number) => ['heroes', heroId, 'skills'] as const,
    ranks: (gameId: number, filters?: Record<string, any>) => 
      ['hero-ranks', { gameId, ...filters }] as const,
    counterData: (gameId: number) => ['heroes', gameId, 'counter-data'] as const,
    compatibilityData: (gameId: number) => ['heroes', gameId, 'compatibility-data'] as const,
  },
  items: {
    all: (gameId: number) => ['items', { gameId }] as const,
  },
  emblems: {
    all: (gameId: number) => ['emblems', { gameId }] as const,
    talents: (gameId: number) => 
      ['emblem-talents', { gameId }] as const,
  },
  spells: {
    all: (gameId: number) => ['battle-spells', { gameId }] as const,
  },
  builds: {
    community: (heroId: number, userId?: number) => ['community-builds', { heroId, userId }] as const,
  },
  patches: {
    all: ['patches'] as const,
    detail: (version: string) => ['patches', version] as const,
    minimal: ['patches', 'minimal'] as const,
  },
} as const;
