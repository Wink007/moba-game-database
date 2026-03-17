import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../../config';

export interface Bo3Player {
  id: number;
  slug: string;
  nickname: string;
  first_name: string;
  last_name: string;
  is_coach: boolean;
  country?: { code: string; name: string };
  image_url?: string;
  image_versions?: { '50x50'?: string };
}

export interface Bo3Game {
  id: number;
  game_number: number;
  status: string;
  winner_team_id: number | null;
  loser_team_id: number | null;
  duration: number | null;
  begin_at: string | null;
  end_at: string | null;
}

export interface Bo3MatchDetail {
  id: number;
  slug: string;
  status: string;
  bo_type: number;
  team1_score: number;
  team2_score: number;
  team1_id: number;
  team2_id: number;
  team1: {
    id: number;
    name: string;
    image_url: string;
    image_versions?: { '50x50'?: string };
    players: Bo3Player[];
  } | null;
  team2: {
    id: number;
    name: string;
    image_url: string;
    image_versions?: { '50x50'?: string };
    players: Bo3Player[];
  } | null;
  mlbb_games: Bo3Game[];
  tournament: { id: number; name: string; slug: string } | null;
  vods: { id: number; raw_url: string; embed_url?: string; name?: string; language?: string; blocked?: boolean }[];
  streams: { id: number; raw_url: string; embed_url?: string; official: boolean; name?: string; language?: string }[];
}

async function fetchMatchDetail(slug: string): Promise<Bo3MatchDetail> {
  const res = await fetch(`${API_URL}/matches/detail/${slug}`);
  if (!res.ok) throw new Error(`match detail fetch failed: ${res.status}`);
  return res.json();
}

export function useMatchDetailQuery(slug: string | null) {
  return useQuery({
    queryKey: ['bo3-match-detail', slug],
    queryFn: () => fetchMatchDetail(slug!),
    enabled: !!slug,
    staleTime: 30_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'live' ? 30_000 : false;
    },
    retry: 1,
  });
}
