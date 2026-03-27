import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useDota2HeroFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedRole = searchParams.get('role') || 'all';
  const selectedAttr = searchParams.get('attr') || 'all';
  const selectedComplexity = searchParams.get('complexity') || 'all';
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

  const apiFilters = {
    role: selectedRole !== 'all' ? selectedRole : undefined,
    attr: selectedAttr !== 'all' ? selectedAttr : undefined,
    complexity: selectedComplexity !== 'all' ? selectedComplexity : undefined,
    search: debouncedSearch || undefined,
    sort: sortBy,
  };

  const clearAll = () => {
    setSearchParams({}, { replace: true });
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedRole !== 'all' ||
    selectedAttr !== 'all' ||
    selectedComplexity !== 'all' ||
    sortBy !== 'name' ||
    !!searchQuery;

  return {
    filters: { selectedRole, selectedAttr, selectedComplexity, sortBy, searchQuery },
    apiFilters,
    hasActiveFilters,
    setters: {
      setSelectedRole: (v: string) => updateParam('role', v),
      setSelectedAttr: (v: string) => updateParam('attr', v),
      setSelectedComplexity: (v: string) => updateParam('complexity', v),
      setSortBy: (v: string) => updateParam('sort', v),
      setSearchQuery,
      clearAll,
    },
  };
};
