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

export const getDamageTypeOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroes.filters.all') },
  { value: 'Physical', label: t('heroes.filters.physical') },
  { value: 'Magic', label: t('heroes.filters.magic') },
  { value: 'Mixed', label: t('heroes.filters.mixed') },
];

export const getSpecialtyOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroes.filters.all') },
  { value: 'Burst', label: t('heroes.filters.burst') },
  { value: 'Chase', label: t('heroes.filters.chase') },
  { value: 'Charge', label: t('heroes.filters.charge') },
  { value: 'Control', label: t('heroes.filters.control') },
  { value: 'Crowd Control', label: t('heroes.filters.crowdControl') },
  { value: 'Damage', label: t('heroes.filters.damage') },
  { value: 'Finisher', label: t('heroes.filters.finisher') },
  { value: 'Guard', label: t('heroes.filters.guard') },
  { value: 'Initiator', label: t('heroes.filters.initiator') },
  { value: 'Magic Damage', label: t('heroes.filters.magicDamage') },
  { value: 'Mixed Damage', label: t('heroes.filters.mixedDamage') },
  { value: 'Poke', label: t('heroes.filters.poke') },
  { value: 'Push', label: t('heroes.filters.push') },
  { value: 'Regen', label: t('heroes.filters.regen') },
  { value: 'Support', label: t('heroes.filters.support') },
];
