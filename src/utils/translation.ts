/**
 * Helper function to get translated hero name based on current language
 */
export const getHeroName = (hero: any, language: string = 'en'): string => {
  if (language === 'uk' && hero.name_uk) {
    return hero.name_uk;
  }
  return hero.name;
};

/**
 * Helper function to get translated hero short description based on current language
 */
export const getHeroShortDescription = (hero: any, language: string = 'en'): string => {
  if (language === 'uk' && hero.short_description_uk) {
    return hero.short_description_uk;
  }
  return hero.short_description || '';
};

/**
 * Helper function to get translated hero full description based on current language
 */
export const getHeroFullDescription = (hero: any, language: string = 'en'): string => {
  if (language === 'uk' && hero.full_description_uk) {
    return hero.full_description_uk;
  }
  return hero.full_description || '';
};

/**
 * Helper function to get translated item name based on current language
 */
export const getItemName = (item: any, language: string = 'en'): string => {
  if (language === 'uk' && item.name_uk) {
    return item.name_uk;
  }
  return item.display_name || item.name;
};

/**
 * Helper function to get translated item description based on current language
 */
export const getItemDescription = (item: any, language: string = 'en'): string => {
  if (language === 'uk' && item.description_uk) {
    return item.description_uk;
  }
  return item.description || '';
};

/**
 * Helper function to get translated item passive description based on current language
 */
export const getItemPassiveDescription = (item: any, language: string = 'en'): string => {
  if (language === 'uk' && item.passive_description_uk) {
    return item.passive_description_uk;
  }
  return item.passive_description || '';
};

/**
 * Helper function to get translated item active name based on current language
 */
export const getItemActiveName = (item: any, language: string = 'en'): string => {
  if (language === 'uk' && item.active_name_uk) {
    return item.active_name_uk;
  }
  return item.active_name || '';
};

/**
 * Helper function to get translated item active description based on current language
 */
export const getItemActiveDescription = (item: any, language: string = 'en'): string => {
  if (language === 'uk' && item.active_description_uk) {
    return item.active_description_uk;
  }
  return item.active_description || '';
};

/**
 * Helper function to get translated skill name based on current language
 */
export const getSkillName = (skill: any, language: string = 'en'): string => {
  if (language === 'uk' && skill.skill_name_uk) {
    return skill.skill_name_uk;
  }
  return skill.skill_name || '';
};

/**
 * Helper function to get translated skill description based on current language
 */
export const getSkillDescription = (skill: any, language: string = 'en'): string => {
  if (language === 'uk' && skill.skill_description_uk) {
    return skill.skill_description_uk;
  }
  return skill.skill_description || '';
};

/**
 * Helper function to get translated battle spell name based on current language
 */
export const getSpellName = (spell: any, language: string = 'en'): string => {
  if (language === 'uk' && spell.name_uk) {
    return spell.name_uk;
  }
  return spell.name;
};

/**
 * Helper function to get translated battle spell overview based on current language
 */
export const getSpellOverview = (spell: any, language: string = 'en'): string => {
  if (language === 'uk' && spell.overview_uk) {
    return spell.overview_uk;
  }
  return spell.overview || '';
};

/**
 * Helper function to get translated battle spell description based on current language
 */
export const getSpellDescription = (spell: any, language: string = 'en'): string => {
  if (language === 'uk' && spell.description_uk) {
    return spell.description_uk;
  }
  return spell.description || '';
};

/**
 * Helper function to get translated emblem name based on current language
 */
export const getEmblemName = (emblem: any, language: string = 'en'): string => {
  if (language === 'uk' && emblem.name_uk) {
    return emblem.name_uk;
  }
  return emblem.name;
};

/**
 * Helper function to get translated emblem description based on current language
 */
export const getEmblemDescription = (emblem: any, language: string = 'en'): string => {
  if (language === 'uk' && emblem.description_uk) {
    return emblem.description_uk;
  }
  return emblem.description || '';
};

/**
 * Helper function to get translated talent name based on current language
 */
export const getTalentName = (talent: any, language: string = 'en'): string => {
  if (language === 'uk' && talent.name_uk) {
    return talent.name_uk;
  }
  return talent.name;
};

/**
 * Helper function to get translated talent effect based on current language
 */
export const getTalentEffect = (talent: any, language: string = 'en'): string => {
  if (language === 'uk' && talent.effect_uk) {
    return talent.effect_uk;
  }
  return talent.effect || '';
};

/**
 * Translate base stat name to Ukrainian
 */
const BASE_STAT_TRANSLATIONS: Record<string, string> = {
  'Adaptive Attack': 'Адаптивна Атака',
  'HP': 'Здоров\'я',
  'Hybrid Regen': 'Гібридне Відновлення',
  'HP Regen': 'Відновлення Здоров\'я',
  'Hybrid Defense': 'Гібридний Захист',
  'Adaptive Penetration': 'Адаптивне Проникнення',
  'Movement Speed': 'Швидкість Пересування',
  'Cooldown Reduction': 'Зменшення Перезарядки',
  'Magic Penetration': 'Магічне Проникнення',
  'Magic Power': 'Магічна Сила',
  'Hybrid Lifesteal': 'Гібридний Вампіризм',
  'Healing Effect': 'Ефект Зцілення',
  'Attack Speed': 'Швидкість Атаки',
  'Lifesteal': 'Вампіризм',
  'Critical Chance': 'Шанс Крит. Удару',
  'Physical Attack': 'Фізична Атака',
};

export const getStatName = (stat: string, language: string = 'en'): string => {
  if (language === 'uk' && BASE_STAT_TRANSLATIONS[stat]) {
    return BASE_STAT_TRANSLATIONS[stat];
  }
  return stat;
};

// Re-export game terminology translation functions
export {
  getRole,
  getLane,
  getDamageType,
  getSpecialty,
  translateRoles,
  translateLanes,
  translateSpecialties
} from './gameTerminology';
