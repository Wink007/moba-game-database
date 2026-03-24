// Activity level system — MLBB ranks
export const ACTIVITY_LEVELS = [
  'rank_warrior',
  'rank_elite',
  'rank_master',
  'rank_grandmaster',
  'rank_epic',
  'rank_legend',
  'rank_mythic',
  'rank_mythic_honor',
  'rank_mythic_glory',
  'rank_immortal',
];

// Score thresholds per level — must match backend TITLE_TIERS in api_server.py
// Formula: days*1 + builds*5 + favorites*1 + mains*2 + upvotes*3
export const LEVEL_THRESHOLDS = [0, 10, 25, 30, 50, 80, 120, 140, 180, 250];
