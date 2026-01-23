import { useMemo } from 'react';
import { Hero } from '../../../types/hero';
import { UseHeroRelationsReturn, CounterHero } from './interface';

export const useHeroRelations = (
  heroName: string | undefined,
  counterData: any,
  compatibilityData: any,
  allHeroes: Hero[]
): UseHeroRelationsReturn => {
  const bestCounters = useMemo(() => {
    if (!heroName || !counterData) return [];
    
    const heroCounters = counterData[heroName];
    if (!heroCounters) return [];

    return Object.entries(heroCounters)
      .map(([name, score]) => ({
        hero: allHeroes.find(h => h.name === name),
        counterScore: score as number,
      }))
      .filter((item): item is CounterHero => item.hero !== undefined)
      .sort((a, b) => b.counterScore - a.counterScore)
      .slice(0, 10);
  }, [heroName, counterData, allHeroes]);

  const worstMatchups = useMemo(() => {
    if (!heroName || !counterData) return [];
    
    const heroCounters = counterData[heroName];
    if (!heroCounters) return [];

    return Object.entries(heroCounters)
      .map(([name, score]) => ({
        hero: allHeroes.find(h => h.name === name),
        counterScore: score as number,
      }))
      .filter((item): item is CounterHero => item.hero !== undefined)
      .sort((a, b) => a.counterScore - b.counterScore)
      .slice(0, 10);
  }, [heroName, counterData, allHeroes]);

  const compatibleHeroes = useMemo(() => {
    if (!heroName || !compatibilityData) return [];
    
    const heroCompatibility = compatibilityData[heroName];
    if (!heroCompatibility) return [];

    return Object.entries(heroCompatibility)
      .map(([name, score]) => ({
        hero: allHeroes.find(h => h.name === name),
        counterScore: score as number,
      }))
      .filter((item): item is CounterHero => item.hero !== undefined)
      .sort((a, b) => b.counterScore - a.counterScore)
      .slice(0, 10);
  }, [heroName, compatibilityData, allHeroes]);

  const incompatibleHeroes = useMemo(() => {
    if (!heroName || !compatibilityData) return [];
    
    const heroCompatibility = compatibilityData[heroName];
    if (!heroCompatibility) return [];

    return Object.entries(heroCompatibility)
      .map(([name, score]) => ({
        hero: allHeroes.find(h => h.name === name),
        counterScore: score as number,
      }))
      .filter((item): item is CounterHero => item.hero !== undefined)
      .sort((a, b) => a.counterScore - b.counterScore)
      .slice(0, 10);
  }, [heroName, compatibilityData, allHeroes]);

  return {
    bestCounters,
    worstMatchups,
    compatibleHeroes,
    incompatibleHeroes,
  };
};
