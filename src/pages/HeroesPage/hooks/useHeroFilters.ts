import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useHeroFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedRole = searchParams.get('role') || 'all';
  const selectedLane = searchParams.get('lane') || 'all';
  const selectedComplexity = searchParams.get('complexity') || 'all';
  const selectedSpecialty = searchParams.get('specialty') || 'all';
  const selectedDamageType = searchParams.get('damage_type') || 'all';
  const sortBy = searchParams.get('sort') || 'name';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'all' || value === '' || (key === 'sort' && value === 'name')) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  };

  /** Params ready for the paginated API (only non-default values). */
  const apiFilters = {
    role: selectedRole !== 'all' ? selectedRole : undefined,
    lane: selectedLane !== 'all' ? selectedLane : undefined,
    complexity: selectedComplexity !== 'all' ? selectedComplexity : undefined,
    specialty: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
    damage_type: selectedDamageType !== 'all' ? selectedDamageType : undefined,
    search: debouncedSearch || undefined,
    sort: sortBy,
  };

  const clearAll = () => {
    setSearchParams({}, { replace: true });
    setSearchQuery('');
  };

  return {
    filters: {
      selectedRole,
      selectedLane,
      selectedComplexity,
      selectedSpecialty,
      selectedDamageType,
      sortBy,
      searchQuery,
    },
    apiFilters,
    setters: {
      setSelectedRole: (v: string) => updateParam('role', v),
      setSelectedLane: (v: string) => updateParam('lane', v),
      setSelectedComplexity: (v: string) => updateParam('complexity', v),
      setSelectedSpecialty: (v: string) => updateParam('specialty', v),
      setSelectedDamageType: (v: string) => updateParam('damage_type', v),
      setSortBy: (v: string) => updateParam('sort', v),
      setSearchQuery,
      clearAll,
    },
  };
};
