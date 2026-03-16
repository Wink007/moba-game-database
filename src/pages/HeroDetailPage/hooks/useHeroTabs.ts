import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UseHeroTabsReturn } from './interface';

type TabKey = 'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds' | 'stats' | 'comments';
const VALID_TABS: TabKey[] = ['info', 'about', 'counter', 'synergy', 'history', 'builds', 'stats', 'comments'];

export const useHeroTabs = (): UseHeroTabsReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [counterSubTab, setCounterSubTab] = useState<'best' | 'worst'>('best');
  const [synergySubTab, setSynergySubTab] = useState<'compatible' | 'incompatible'>('compatible');

  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'info';

  const setActiveTab = useCallback((tab: TabKey) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'info') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return {
    activeTab,
    counterSubTab,
    synergySubTab,
    setActiveTab,
    setCounterSubTab,
    setSynergySubTab,
  };
};
