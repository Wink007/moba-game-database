export const getDaysOptions = (t: (key: string) => string) => [
  { value: 1, label: t('heroRank.filters.days.1') },
  { value: 15, label: t('heroRank.filters.days.15') },
  { value: 30, label: t('heroRank.filters.days.30') },
];

export const getRankOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroRank.filters.ranks.all') },
  { value: 'epic', label: t('heroRank.filters.ranks.epic') },
  { value: 'legend', label: t('heroRank.filters.ranks.legend') },
  { value: 'mythic', label: t('heroRank.filters.ranks.mythic') },
  { value: 'honor', label: t('heroRank.filters.ranks.honor') },
  { value: 'glory', label: t('heroRank.filters.ranks.glory') },
];

export const getSortOptions = (t: (key: string) => string) => [
  { value: 'win_rate', label: t('heroRank.filters.sort.winRate') },
  { value: 'pick_rate', label: t('heroRank.filters.sort.pickRate') },
  { value: 'ban_rate', label: t('heroRank.filters.sort.banRate') },
];

export const ITEMS_PER_PAGE = 20;
