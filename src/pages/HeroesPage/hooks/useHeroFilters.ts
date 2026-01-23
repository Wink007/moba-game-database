import { useState, useMemo } from 'react';
import { Hero } from '../../../types';
import { UseHeroFiltersProps } from './interface';

const HEROES_PER_PAGE = 24;

export const useHeroFilters = ({ heroes }: UseHeroFiltersProps) => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLane, setSelectedLane] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(HEROES_PER_PAGE);

  const filteredAndSortedHeroes = useMemo(() => {
    if (!heroes) return [];

    let filtered = heroes.filter((hero: Hero) => {
      const matchesRole = selectedRole === 'all' || (hero as any).roles?.includes(selectedRole);
      const matchesLane = selectedLane === 'all' || hero.lane?.includes(selectedLane as any);
      
      let matchesComplexity = selectedComplexity === 'all';
      if (!matchesComplexity && (hero as any).abilityshow && (hero as any).abilityshow[3] !== undefined) {
        const difficultyValue = Number((hero as any).abilityshow[3]);
        
        if (selectedComplexity === 'Easy' && difficultyValue <= 33) {
          matchesComplexity = true;
        } else if (selectedComplexity === 'Medium' && difficultyValue > 33 && difficultyValue <= 66) {
          matchesComplexity = true;
        } else if (selectedComplexity === 'Hard' && difficultyValue > 66) {
          matchesComplexity = true;
        }
      }
      
      const matchesSearch = !searchQuery || hero.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesRole && matchesLane && matchesComplexity && matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return filtered;
  }, [heroes, selectedRole, selectedLane, selectedComplexity, sortBy, searchQuery]);

  const displayedHeroes = useMemo(() => {
    return filteredAndSortedHeroes.slice(0, displayCount);
  }, [filteredAndSortedHeroes, displayCount]);

  const hasMore = displayCount < filteredAndSortedHeroes.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + HEROES_PER_PAGE);
  };

  const handleFilterChange = () => {
    setDisplayCount(HEROES_PER_PAGE);
  };

  return {
    filters: {
      selectedRole,
      selectedLane,
      selectedComplexity,
      sortBy,
      searchQuery,
    },
    setters: {
      setSelectedRole,
      setSelectedLane,
      setSelectedComplexity,
      setSortBy,
      setSearchQuery,
    },
    results: {
      filteredAndSortedHeroes,
      displayedHeroes,
      hasMore,
    },
    actions: {
      handleLoadMore,
      handleFilterChange,
    },
  };
};
