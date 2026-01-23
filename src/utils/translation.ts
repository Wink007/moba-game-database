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
