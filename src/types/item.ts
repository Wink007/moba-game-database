export interface ItemRecipe {
  id: number;
  name: string;
}

export interface ItemAttributes {
  physical_attack?: number;
  magic_power?: number;
  attack_speed?: number;
  physical_defense?: number;
  magic_defense?: number;
  hp?: number;
  mana_regen?: number;
  cooldown_reduction?: number;
  crit_chance?: number;
  lifesteal?: number;
  spell_vamp?: number;
  penetration?: number;
  movement_speed?: number;
  adaptive_attack?: number;
  [key: string]: number | undefined; // Для інших можливих атрибутів
}

export interface Item {
  id: number;
  game_id: number;
  name: string;
  display_name?: string | null;
  description?: string;
  icon_url?: string;
  category?: string;
  tier?: string;
  
  // Ціни
  price_total?: number;
  price_sell?: number;
  price_upgrade?: number;
  
  // Статуси
  removed?: number;
  sellable?: number;
  
  // Базові стати
  physical_attack?: number;
  magic_power?: number;
  attack_speed?: number;
  physical_defense?: number;
  magic_defense?: number;
  hp?: number;
  mana_regen?: number;
  cooldown_reduction?: number;
  crit_chance?: number;
  lifesteal?: number;
  spell_vamp?: number;
  penetration?: number;
  movement_speed?: number;
  adaptive_attack?: number;
  
  // Attributes об'єкт і JSON
  attributes?: ItemAttributes;
  attributes_json?: string;
  
  // Пасивка
  passive_name?: string | null;
  passive_description?: string | null;
  passive_type?: string | null;
  passive_effects?: string | null;
  
  // Рецепт та апгрейди
  recipe?: ItemRecipe[] | string | null;
  recipe_components?: ItemRecipe[] | string | null;
  builds?: any | null;
  upgrades_to?: any | null;
  countered_by?: any | null;
  
  // Додаткова інформація
  availability_description?: string;
  in_depth_info?: string | null;
  stats_other?: string | null;
  tags?: string | null;
  tips?: string | null;
  
  // Дати
  created_at?: string;
  
  // Застарілі поля для зворотної сумісності
  item_game_id?: string;
  image?: string;
  item_type?: string;
  cost?: number;
  stats?: string | ItemAttributes;
  icon?: string;
}
