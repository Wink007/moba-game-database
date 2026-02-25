import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useHeroesQuery, useHeroCounterDataQuery } from '../../queries/useHeroesQuery';
import { getHeroName } from '../../utils/translation';
import type { Hero, HeroCounterData, CounterHero } from '../../types';
import type { Mode, AggregatedCounter, SingleResultsData } from './types';

export function useCounterPick(gameId: number, lang: string) {
  const { data: allHeroes, isLoading: heroesLoading } = useHeroesQuery(gameId);
  const { data: counterData, isLoading: counterLoading } = useHeroCounterDataQuery(gameId);

  const [mode, setMode] = useState<Mode>('single');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [teamHeroes, setTeamHeroes] = useState<Hero[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
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

  const findHeroByGameId = useCallback(
    (heroId: number): Hero | undefined => heroByGameId.get(heroId),
    [heroByGameId],
  );

  // Pre-sorted hero list
  const sortedHeroes = useMemo(() => {
    if (!allHeroes) return [];
    return [...allHeroes].sort((a, b) => getHeroName(a, lang).localeCompare(getHeroName(b, lang)));
  }, [allHeroes, lang]);

  const filteredHeroes = useMemo(() => {
    if (!sortedHeroes.length) return [];
    if (!searchQuery) return sortedHeroes;
    const q = searchQuery.toLowerCase();
    return sortedHeroes.filter(h => {
      const name = getHeroName(h, lang).toLowerCase();
      const nameEn = h.name.toLowerCase();
      return name.includes(q) || nameEn.includes(q);
    });
  }, [sortedHeroes, searchQuery, lang]);

  // Role filter
  const ROLE_ORDER = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'] as const;
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const displayedHeroes = useMemo(() => {
    if (!roleFilter) return filteredHeroes;
    return filteredHeroes.filter(h => h.roles?.includes(roleFilter));
  }, [filteredHeroes, roleFilter]);

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
    setSelectedHero(null);
    setTeamHeroes([]);
    setIsSelectorOpen(false);
    setSelectingSlot(null);
  }, []);

  // --- Single mode results ---
  const singleResults = useMemo((): SingleResultsData | null => {
    if (mode !== 'single' || !selectedHero || !counterData) return null;
    const heroGameId = selectedHero.hero_game_id ?? selectedHero.id;
    const data: HeroCounterData | undefined = counterData[heroGameId];
    if (!data) return null;

    const enrichCounter = (c: CounterHero) => {
      const hero = findHeroByGameId(c.heroid);
      const winRate = Math.abs(c.win_rate) < 1 ? c.win_rate * 100 : c.win_rate;
      const increaseWinRate = Math.abs(c.increase_win_rate) < 1 ? c.increase_win_rate * 100 : c.increase_win_rate;
      return { ...c, hero, winRate, increaseWinRate };
    };

    return {
      mainWinRate: data.main_hero_win_rate
        ? (data.main_hero_win_rate < 1 ? data.main_hero_win_rate * 100 : data.main_hero_win_rate)
        : null,
      bestCounters: (data.best_counters || []).map(enrichCounter).filter(c => c.hero),
      mostCounteredBy: (data.most_countered_by || []).map(enrichCounter).filter(c => c.hero),
    };
  }, [mode, selectedHero, counterData, findHeroByGameId]);

  // --- Team mode results ---
  const teamResults = useMemo((): AggregatedCounter[] | null => {
    if (mode !== 'team' || teamHeroes.length === 0 || !counterData || !allHeroes) return null;

    const selectedIds = new Set(teamHeroes.map(h => h.hero_game_id ?? h.id));
    const scoreMap = new Map<number, { totalScore: number; totalWinRate: number; count: number; details: { enemyHero: Hero; increaseWinRate: number; winRate: number }[] }>();

    teamHeroes.forEach(enemyHero => {
      const enemyGameId = enemyHero.hero_game_id ?? enemyHero.id;
      const enemyCounterData = counterData[enemyGameId];
      if (!enemyCounterData?.most_countered_by) return;

      enemyCounterData.most_countered_by.forEach(counter => {
        if (selectedIds.has(counter.heroid)) return;

        const increaseWinRate = Math.abs(counter.increase_win_rate) < 1 ? counter.increase_win_rate * 100 : counter.increase_win_rate;
        const winRate = counter.win_rate < 1 ? counter.win_rate * 100 : counter.win_rate;

        const existing = scoreMap.get(counter.heroid);
        if (existing) {
          existing.totalScore += increaseWinRate;
          existing.totalWinRate += winRate;
          existing.count += 1;
          existing.details.push({ enemyHero, increaseWinRate, winRate });
        } else {
          scoreMap.set(counter.heroid, {
            totalScore: increaseWinRate,
            totalWinRate: winRate,
            count: 1,
            details: [{ enemyHero, increaseWinRate, winRate }],
          });
        }
      });
    });

    const results: AggregatedCounter[] = [];
    scoreMap.forEach((value, heroId) => {
      const hero = findHeroByGameId(heroId);
      if (hero) {
        results.push({
          heroId,
          hero,
          totalScore: value.totalScore,
          avgWinRate: value.totalWinRate / value.count,
          details: value.details,
        });
      }
    });

    results.sort((a, b) => b.totalScore - a.totalScore);
    return results.slice(0, 15);
  }, [mode, teamHeroes, counterData, allHeroes, findHeroByGameId]);

  return {
    // state
    mode,
    selectedHero,
    teamHeroes,
    searchQuery,
    isSelectorOpen,
    selectingSlot,
    selectorRef,
    filteredHeroes: displayedHeroes,
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
