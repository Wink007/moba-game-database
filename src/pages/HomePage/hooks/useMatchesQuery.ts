import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../../config';

export type MatchesMode = 'upcoming' | 'finished';

export interface Bo3Team {
  slug: string;
  name: string;
  image_url: string;
  image_versions?: { '50x50'?: string };
}

export interface Bo3Tournament {
  id: number;
  slug: string;
  name: string;
  tier: string;
  image_url: string;
  image_versions?: { '50x50'?: string };
}

export interface Bo3BetUpdates {
  team_1: { coeff: number; active: boolean } | null;
  team_2: { coeff: number; active: boolean } | null;
  path?: string;
}

export interface Bo3Match {
  id: number;
  slug: string;
  status: 'upcoming' | 'live' | 'finished';
  parsed_status: string;
  bo_type: number;
  tier: string;
  start_date: string;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  ai_predictions: {
    prediction_team1_score: number;
    prediction_team2_score: number;
    prediction_winner_team_id: number;
  } | null;
  bet_updates: Bo3BetUpdates | null;
  tournament: Bo3Tournament | null;
  team1: Bo3Team | null;
  team2: Bo3Team | null;
}

export interface Bo3DayData {
  date: string;
  prevDate: string | null;
  nextDate: string | null;
  matches: Bo3Match[];
}

async function fetchMatches(date: string, mode: MatchesMode): Promise<Bo3DayData> {
  const utcOffset = -new Date().getTimezoneOffset() * 60;
  const url = `${API_URL}/matches/${mode}?date=${date}&utc_offset=${utcOffset}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`matches fetch failed: ${res.status}`);
  const raw = await res.json();

  const tiers: Record<string, { matches: any[] }> = raw?.data?.tiers ?? {};
  const inc = raw?.included ?? {};
  const teams: Record<string, Bo3Team> = inc.teams ?? {};
  const tournaments: Record<string, Bo3Tournament> = inc.tournaments ?? {};

  const matches: Bo3Match[] = [];
  for (const tier of Object.values(tiers)) {
    for (const m of tier.matches ?? []) {
      const tournamentId = typeof m.tournament === 'object' ? m.tournament?.id : m.tournament;
      matches.push({
        ...m,
        team1: teams[String(m.team1_id)] ?? m.team1 ?? null,
        team2: teams[String(m.team2_id)] ?? m.team2 ?? null,
        tournament: tournaments[String(tournamentId)] ?? (typeof m.tournament === 'object' ? m.tournament : null),
      });
    }
  }

  matches.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return {
    date,
    prevDate: raw?.meta?.prev_date ?? null,
    nextDate: raw?.meta?.next_date ?? null,
    matches,
  };
}

export function useMatchesQuery(date: string, mode: MatchesMode) {
  return useQuery({
    queryKey: ['bo3-matches', mode, date],
    queryFn: () => fetchMatches(date, mode),
    staleTime: mode === 'upcoming' ? 2 * 60_000 : 5 * 60_000,
    refetchInterval: (query) => {
      if (mode !== 'upcoming') return false;
      const hasLive = query.state.data?.matches.some(m => m.status === 'live');
      return hasLive ? 30_000 : 2 * 60_000;
    },
    retry: 1,
  });
}
