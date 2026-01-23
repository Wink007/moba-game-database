export const getRoleOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroes.filters.allRoles') },
  { value: 'Tank', label: t('heroes.filters.tank') },
  { value: 'Fighter', label: t('heroes.filters.fighter') },
  { value: 'Assassin', label: t('heroes.filters.assassin') },
  { value: 'Mage', label: t('heroes.filters.mage') },
  { value: 'Marksman', label: t('heroes.filters.marksman') },
  { value: 'Support', label: t('heroes.filters.support') },
];

export const getLaneOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroes.filters.allLanes') },
  { value: 'Exp Lane', label: t('heroes.filters.expLane') },
  { value: 'Mid Lane', label: t('heroes.filters.midLane') },
  { value: 'Gold Lane', label: t('heroes.filters.goldLane') },
  { value: 'Jungle', label: t('heroes.filters.jungle') },
  { value: 'Roam', label: t('heroes.filters.roam') },
];

export const getComplexityOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroes.filters.all') },
  { value: 'Easy', label: t('heroes.filters.simple') },
  { value: 'Medium', label: t('heroes.filters.moderate') },
  { value: 'Hard', label: t('heroes.filters.complex') },
];

export const getSortOptions = (t: (key: string) => string) => [
  { value: 'name', label: t('heroes.filters.name') },
  { value: 'newest', label: t('heroes.filters.newestFirst') },
];

export const HEROES_PER_PAGE = 20;
