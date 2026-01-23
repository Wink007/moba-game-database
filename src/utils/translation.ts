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
  return item.name;
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
