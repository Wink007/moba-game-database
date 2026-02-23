export const queryKeys = {
  games: {
    all: ['games'] as const,
    detail: (id: number) => ['games', id] as const,
    stats: (id: number) => ['games', id, 'stats'] as const,
  },
  heroes: {
    all: (gameId: number) => ['heroes', { gameId }] as const,
    paginated: (gameId: number, filters?: Record<string, any>) =>
      ['heroes', 'paginated', { gameId, ...filters }] as const,
    detail: (id: number) => ['heroes', id] as const,
    skills: (heroId: number) => ['heroes', heroId, 'skills'] as const,
    ranks: (gameId: number, filters?: Record<string, any>) => 
      ['hero-ranks', { gameId, ...filters }] as const,
    relations: (gameId: number) => ['heroes', gameId, 'relations'] as const,
    counterData: (gameId: number) => ['heroes', gameId, 'counter-data'] as const,
    compatibilityData: (gameId: number) => ['heroes', gameId, 'compatibility-data'] as const,
    rank: (heroId: number) => ['heroes', heroId, 'rank'] as const,
    rankHistory: (gameId: number, heroGameId: number) => ['heroes', gameId, heroGameId, 'rank-history'] as const,
  },
  items: {
    all: (gameId: number) => ['items', { gameId }] as const,
    detail: (id: number) => ['items', id] as const,
  },
  emblems: {
    all: (gameId: number) => ['emblems', { gameId }] as const,
    talents: (gameId: number, tier: number) => 
      ['emblem-talents', { gameId, tier }] as const,
  },
  spells: {
    all: (gameId: number) => ['battle-spells', { gameId }] as const,
  },
  patches: {
    all: ['patches'] as const,
    detail: (version: string) => ['patches', version] as const,
  },
} as const;
