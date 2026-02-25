/**
 * Generic helper: returns the Ukrainian variant of a field when available,
 * or falls back to the base field (with an optional `fallbackField`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translatable = { [K: string]: any };

const t = (
  obj: Translatable,
  field: string,
  language: string,
  fallbackField?: string,
): string => {
  if (language === 'uk') {
    const ukValue = obj[`${field}_uk`];
    if (ukValue) return String(ukValue);
  }
  const val = obj[fallbackField ?? field] ?? obj[field] ?? '';
  return String(val);
};

/* ── Hero ────────────────────────────────────────────────── */
export const getHeroName = (hero: Translatable, language: string = 'en'): string =>
  t(hero, 'name', language);

export const getHeroShortDescription = (hero: Translatable, language: string = 'en'): string =>
  t(hero, 'short_description', language);

export const getHeroFullDescription = (hero: Translatable, language: string = 'en'): string =>
  t(hero, 'full_description', language);

/* ── Item ────────────────────────────────────────────────── */
export const getItemName = (item: Translatable, language: string = 'en'): string => {
  if (language === 'uk' && item.name_uk) return String(item.name_uk);
  return String(item.display_name || item.name);
};

export const getItemDescription = (item: Translatable, language: string = 'en'): string =>
  t(item, 'description', language);

/* ── Skill ───────────────────────────────────────────────── */
export const getSkillName = (skill: Translatable, language: string = 'en'): string =>
  t(skill, 'skill_name', language);

export const getSkillDescription = (skill: Translatable, language: string = 'en'): string =>
  t(skill, 'skill_description', language);

/* ── Battle Spell ────────────────────────────────────────── */
export const getSpellName = (spell: Translatable, language: string = 'en'): string =>
  t(spell, 'name', language);

export const getSpellOverview = (spell: Translatable, language: string = 'en'): string =>
  t(spell, 'overview', language);

export const getSpellDescription = (spell: Translatable, language: string = 'en'): string =>
  t(spell, 'description', language);

/* ── Emblem ──────────────────────────────────────────────── */
export const getEmblemName = (emblem: Translatable, language: string = 'en'): string =>
  t(emblem, 'name', language);

export const getEmblemDescription = (emblem: Translatable, language: string = 'en'): string =>
  t(emblem, 'description', language);

/* ── Talent ──────────────────────────────────────────────── */
export const getTalentName = (talent: Translatable, language: string = 'en'): string =>
  t(talent, 'name', language);

export const getTalentEffect = (talent: Translatable, language: string = 'en'): string =>
  t(talent, 'effect', language);

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
