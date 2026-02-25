import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useHeroesQuery, useHeroCounterDataQuery } from '../../queries/useHeroesQuery';
import { getHeroName } from '../../utils/translation';
import type { Hero, HeroCounterData, CounterHero } from '../../types';
import type { Mode, AggregatedCounter, SingleResultsData } from './types';

const ROLE_ORDER = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'] as const;

/** Normalize API values that may come as 0..1 fractions or already as percentages */
const pct = (v: number) => (Math.abs(v) < 1 ? v * 100 : v);

export function useCounterPick(gameId: number, lang: string) {
  const { data: allHeroes, isLoading: heroesLoading } = useHeroesQuery(gameId);
  const { data: counterData, isLoading: counterLoading } = useHeroCounterDataQuery(gameId);

  const [mode, setMode] = useState<Mode>('single');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [teamHeroes, setTeamHeroes] = useState<Hero[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // O(1) hero lookup map
  const heroByGameId = useMemo(() => {
    if (!allHeroes) return new Map<number, Hero>();
    const map = new Map<number, Hero>();
    allHeroes.forEach(h => {
      if (h.hero_game_id != null) map.set(h.hero_game_id, h);
      if (!map.has(h.id)) map.set(h.id, h);
    });
    return map;
  }, [allHeroes]);

  // Sorted + text-search + role filter in one pass
  const filteredHeroes = useMemo(() => {
    if (!allHeroes) return [];
    let list = [...allHeroes].sort((a, b) => getHeroName(a, lang).localeCompare(getHeroName(b, lang)));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => getHeroName(h, lang).toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
    }
    if (roleFilter) {
      list = list.filter(h => h.roles?.includes(roleFilter));
    }
    return list;
  }, [allHeroes, lang, searchQuery, roleFilter]);

  // Close selector on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setIsSelectorOpen(false);
        setSelectingSlot(null);
      }
    };
    if (isSelectorOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isSelectorOpen]);

  const handleSelectHero = useCallback((hero: Hero) => {
    if (mode === 'single') {
      setSelectedHero(hero);
      setIsSelectorOpen(false);
    } else {
      if (selectingSlot !== null) {
        setTeamHeroes(prev => {
          const next = [...prev];
          next[selectingSlot] = hero;
          return next;
        });
        setSelectingSlot(null);
        setIsSelectorOpen(false);
      } else {
        setTeamHeroes(prev => {
          if (prev.length >= 5 || prev.find(h => h.id === hero.id)) return prev;
          return [...prev, hero];
        });
        setIsSelectorOpen(false);
      }
    }
    setSearchQuery('');
  }, [mode, selectingSlot]);

  const openSelector = useCallback((slotIndex?: number) => {
    setSelectingSlot(slotIndex ?? null);
    setIsSelectorOpen(true);
    setSearchQuery('');
    setRoleFilter(null);
  }, []);

  const closeSelector = useCallback(() => {
    setIsSelectorOpen(false);
    setSelectingSlot(null);
  }, []);

  const removeTeamHero = useCallback((index: number) => {
    setTeamHeroes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedHero(null);
    setTeamHeroes([]);
  }, []);

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setIsSelectorOpen(false);
    setSelectingSlot(null);
  }, []);

  // --- Single mode results ---
  const singleResults = useMemo((): SingleResultsData | null => {
    if (mode !== 'single' || !selectedHero || !counterData) return null;
    const heroGameId = selectedHero.hero_game_id ?? selectedHero.id;
    const data: HeroCounterData | undefined = counterData[heroGameId];
    if (!data) return null;

    const enrich = (c: CounterHero) => ({
      ...c,
      hero: heroByGameId.get(c.heroid),
      winRate: pct(c.win_rate),
      increaseWinRate: pct(c.increase_win_rate),
    });

    return {
      mainWinRate: data.main_hero_win_rate ? pct(data.main_hero_win_rate) : null,
      bestCounters: (data.best_counters || []).map(enrich).filter(c => c.hero),
      mostCounteredBy: (data.most_countered_by || []).map(enrich).filter(c => c.hero),
    };
  }, [mode, selectedHero, counterData, heroByGameId]);

  // --- Team mode results ---
  const teamResults = useMemo((): AggregatedCounter[] | null => {
    if (mode !== 'team' || teamHeroes.length === 0 || !counterData || !allHeroes) return null;

    const selectedIds = new Set(teamHeroes.map(h => h.hero_game_id ?? h.id));
    const scoreMap = new Map<number, { totalScore: number; totalWinRate: number; count: number; details: AggregatedCounter['details'] }>();

    for (const enemyHero of teamHeroes) {
      const data = counterData[enemyHero.hero_game_id ?? enemyHero.id];
      if (!data?.most_countered_by) continue;

      for (const c of data.most_countered_by) {
        if (selectedIds.has(c.heroid)) continue;
        const iwr = pct(c.increase_win_rate);
        const wr = pct(c.win_rate);
        const prev = scoreMap.get(c.heroid);
        if (prev) {
          prev.totalScore += iwr;
          prev.totalWinRate += wr;
          prev.count += 1;
          prev.details.push({ enemyHero, increaseWinRate: iwr, winRate: wr });
        } else {
          scoreMap.set(c.heroid, { totalScore: iwr, totalWinRate: wr, count: 1, details: [{ enemyHero, increaseWinRate: iwr, winRate: wr }] });
        }
      }
    }

    const results: AggregatedCounter[] = [];
    scoreMap.forEach((v, heroId) => {
      const hero = heroByGameId.get(heroId);
      if (hero) results.push({ heroId, hero, totalScore: v.totalScore, avgWinRate: v.totalWinRate / v.count, details: v.details });
    });
    results.sort((a, b) => b.totalScore - a.totalScore);
    return results.slice(0, 15);
  }, [mode, teamHeroes, counterData, allHeroes, heroByGameId]);

  return {
    // state
    mode,
    selectedHero,
    teamHeroes,
    searchQuery,
    isSelectorOpen,
    selectingSlot,
    selectorRef,
    filteredHeroes,
    roleFilter,
    setRoleFilter,
    roles: ROLE_ORDER,
    isLoading: heroesLoading || counterLoading,

    // results
    singleResults,
    teamResults,

    // actions
    setSelectedHero,
    setSearchQuery,
    handleSelectHero,
    openSelector,
    closeSelector,
    removeTeamHero,
    clearAll,
    switchMode,
  };
}
