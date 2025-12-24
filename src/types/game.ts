export interface Game {
  id: number;
  name: string;
  description: string;
  release_date?: string;
  genre?: string;
  background_image?: string;
  video_intro?: string;
  subtitle?: string;
  preview?: string;
  icon?: string;
}

export interface GameStats {
  total_heroes: number;
  total_items: number;
  total_skills: number;
}
