import { useState, useEffect } from 'react';

export const useHeroFilters = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLane, setSelectedLane] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /** Params ready for the paginated API (only non-default values). */
  const apiFilters = {
    role: selectedRole !== 'all' ? selectedRole : undefined,
    lane: selectedLane !== 'all' ? selectedLane : undefined,
    complexity: selectedComplexity !== 'all' ? selectedComplexity : undefined,
    search: debouncedSearch || undefined,
    sort: sortBy,
  };

  return {
    filters: {
      selectedRole,
      selectedLane,
      selectedComplexity,
      sortBy,
      searchQuery,
    },
    apiFilters,
    setters: {
      setSelectedRole,
      setSelectedLane,
      setSelectedComplexity,
      setSortBy,
      setSearchQuery,
    },
  };
};
