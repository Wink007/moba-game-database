// Game terminology translations for roles, lanes, damage types, and specialties

export const roleTranslations: Record<string, { en: string; uk: string }> = {
  'Assassin': { en: 'Assassin', uk: 'Асасин' },
  'Fighter': { en: 'Fighter', uk: 'Боєць' },
  'Marksman': { en: 'Marksman', uk: 'Стрілець' },
  'Mage': { en: 'Mage', uk: 'Маг' },
  'Support': { en: 'Support', uk: 'Підтримка' },
  'Tank': { en: 'Tank', uk: 'Танк' }
};

export const laneTranslations: Record<string, { en: string; uk: string }> = {
  'Gold Lane': { en: 'Gold Lane', uk: 'Голд лінія' },
  'Jungle': { en: 'Jungle', uk: 'Ліс' },
  'Mid Lane': { en: 'Mid Lane', uk: 'Мід лінія' },
  'Exp Lane': { en: 'Exp Lane', uk: 'Лінія досвіду' },
  'Roam': { en: 'Roam', uk: 'Роум' }
};

export const damageTypeTranslations: Record<string, { en: string; uk: string }> = {
  'Physical': { en: 'Physical', uk: 'Фізична' },
  'Magic': { en: 'Magic', uk: 'Магічна' },
  'Mixed': { en: 'Mixed', uk: 'Змішана' }
};

export const specialtyTranslations: Record<string, { en: string; uk: string }> = {
  'Regen': { en: 'Regen', uk: 'Регенерація' },
  'Crowd Control': { en: 'Crowd Control', uk: 'Контроль натовпу' },
  'Finisher': { en: 'Finisher', uk: 'Добивач' },
  'Charge': { en: 'Charge', uk: 'Штурм' },
  'Push': { en: 'Push', uk: 'Пуш' },
  'Damage': { en: 'Damage', uk: 'Урон' },
  'Burst': { en: 'Burst', uk: 'Вибух' },
  'Poke': { en: 'Poke', uk: 'Тримання дистанції' },
  'Initiator': { en: 'Initiator', uk: 'Ініціатор' },
  'Magic Damage': { en: 'Magic Damage', uk: 'Магічний урон' },
  'Mixed Damage': { en: 'Mixed Damage', uk: 'Змішаний урон' },
  'Guard': { en: 'Guard', uk: 'Захисник' },
  'Chase': { en: 'Chase', uk: 'Переслідувач' },
  'Control': { en: 'Control', uk: 'Контроль' },
  'Support': { en: 'Support', uk: 'Підтримка' }
};

// Helper functions to get translated terminology
export const getRole = (role: string, language: string = 'en'): string => {
  if (!role) return '';
  const translation = roleTranslations[role];
  return translation?.[language as 'en' | 'uk'] || role;
};

export const getLane = (lane: string, language: string = 'en'): string => {
  if (!lane) return '';
  const translation = laneTranslations[lane];
  return translation?.[language as 'en' | 'uk'] || lane;
};

export const getDamageType = (damageType: string, language: string = 'en'): string => {
  if (!damageType) return '';
  const translation = damageTypeTranslations[damageType];
  return translation?.[language as 'en' | 'uk'] || damageType;
};

export const getSpecialty = (specialty: string, language: string = 'en'): string => {
  if (!specialty) return '';
  const translation = specialtyTranslations[specialty];
  return translation?.[language as 'en' | 'uk'] || specialty;
};

// Helper for translating arrays
export const translateRoles = (roles: string[], language: string = 'en'): string[] => {
  return roles?.map(role => getRole(role, language)) || [];
};

export const translateLanes = (lanes: string[], language: string = 'en'): string[] => {
  return lanes?.map(lane => getLane(lane, language)) || [];
};

export const translateSpecialties = (specialties: string[], language: string = 'en'): string[] => {
  return specialties?.map(specialty => getSpecialty(specialty, language)) || [];
};
