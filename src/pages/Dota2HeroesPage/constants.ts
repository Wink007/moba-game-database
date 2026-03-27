export const DOTA2_GAME_ID = 8;

export const getDota2RoleOptions = (t: (key: string) => string) => [
  { value: 'all', label: t('heroes.filters.allRoles') },
  { value: 'Carry', label: 'Carry' },
  { value: 'Support', label: 'Support' },
  { value: 'Nuker', label: 'Nuker' },
  { value: 'Disabler', label: 'Disabler' },
  { value: 'Jungler', label: 'Jungler' },
  { value: 'Durable', label: 'Durable' },
  { value: 'Escape', label: 'Escape' },
  { value: 'Pusher', label: 'Pusher' },
  { value: 'Initiator', label: 'Initiator' },
];

export const getDota2AttrOptions = () => [
  { value: 'all', label: 'All Attributes' },
  { value: 'str', label: '💪 Strength' },
  { value: 'agi', label: '⚡ Agility' },
  { value: 'int', label: '🔵 Intelligence' },
  { value: 'universal', label: '✨ Universal' },
];

export const getDota2ComplexityOptions = () => [
  { value: 'all', label: 'All' },
  { value: 'Easy', label: 'Simple' },
  { value: 'Medium', label: 'Moderate' },
  { value: 'Hard', label: 'Complex' },
];

export const getDota2SortOptions = (t: (key: string) => string) => [
  { value: 'name', label: t('heroes.filters.name') },
  { value: 'newest', label: t('heroes.filters.newestFirst') },
];

export const ATTR_LABEL: Record<string, string> = {
  str: '💪',
  agi: '⚡',
  int: '🔵',
  universal: '✨',
};
