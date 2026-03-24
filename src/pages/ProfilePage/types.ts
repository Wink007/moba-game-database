export interface FollowUser {
  id: number;
  name: string;
  picture: string;
}

export interface ProfileUser {
  id: number;
  name: string;
  picture: string;
  created_at: string;
  nickname?: string | null;
  banner_hero_id?: number | null;
  banner_image?: string | null;
  banner_painting?: string | null;
  banner_hero_name?: string | null;
  mlbb_role_id?: string | null;
  mlbb_zone_id?: string | null;
  mlbb_nickname?: string | null;
  mlbb_avatar?: string | null;
}

export interface MainHero {
  hero_id: number;
  position: number;
  name: string;
  head?: string;
  image?: string;
  game_id?: number;
}

export interface ProfileBuild {
  id: number;
  hero_id: number;
  name: string;
  hero_name: string;
  hero_head?: string;
  hero_image?: string;
  items: number[];
  upvotes: number;
  downvotes: number;
  user_vote?: number;
  created_at: string;
}

export interface FavoriteHero {
  id: number;
  name: string;
  head?: string;
  image?: string;
  game_id?: number;
}

export interface ProfileData {
  user: ProfileUser;
  main_heroes: MainHero[];
  builds: ProfileBuild[];
  favorites_count: number;
  favorites: FavoriteHero[];
  activity_title?: string;
  activity_score?: number;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface MlbbHeroStat {
  hero_id: number;
  total_games: number;
  wins: number;
  win_rate: number;
  mvp: number;
  kda: number;
  level: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  max_kills: number;
  max_kda: number;
  avg_damage: number;
  avg_taken: number;
  penta_kills: number;
  quadra_kills: number;
  triple_kills: number;
  double_kills: number;
}

export type MlbbSortKey = 'total_games' | 'win_rate' | 'kda' | 'mvp' | 'avg_kills' | 'avg_damage';

// Component Props
export interface ActivityLevelProps {
  score: number;
}

export interface BannerPickerModalProps {
  heroes: any[];
  currentBannerHeroId?: number | null;
  onSelect: (heroId: number) => void;
  onClose: () => void;
  saving: boolean;
}

export interface FollowsModalProps {
  userId: number;
  type: 'followers' | 'following';
  onClose: () => void;
}

export interface MlbbHeroCardProps {
  stat: MlbbHeroStat;
  hero?: { name: string; head?: string };
  isExpanded: boolean;
  onToggle: () => void;
}

export interface MlbbStatsProps {
  stats: MlbbHeroStat[];
  seasons: number[];
  heroes: any[];
  season: number;
  onSeasonChange: (season: number) => void;
}

export interface MlbbLinkFormProps {
  onLinked: (nickname: string) => void;
  onClose: () => void;
}

export interface MlbbSectionProps {
  user: ProfileUser;
  heroes: any[];
  userId: number;
  onProfileRefresh: () => void;
}
