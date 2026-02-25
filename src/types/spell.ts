export interface BattleSpell {
  id: number;
  game_id: number;
  name: string;
  name_uk?: string;
  overview?: string;
  overview_uk?: string;
  description?: string;
  description_uk?: string;
  cooldown?: number;
  unlocked_level?: number;
  icon_url?: string;
}
