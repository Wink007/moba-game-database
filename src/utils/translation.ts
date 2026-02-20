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
