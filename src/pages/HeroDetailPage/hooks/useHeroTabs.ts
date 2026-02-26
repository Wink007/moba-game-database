import { useState } from 'react';
import { UseHeroTabsReturn } from './interface';

export const useHeroTabs = (): UseHeroTabsReturn => {
  const [activeTab, setActiveTab] = useState<'info' | 'about' | 'counter' | 'synergy' | 'history' | 'builds' | 'stats'>('info');
  const [counterSubTab, setCounterSubTab] = useState<'best' | 'worst'>('best');
  const [synergySubTab, setSynergySubTab] = useState<'compatible' | 'incompatible'>('compatible');

  return {
    activeTab,
    counterSubTab,
    synergySubTab,
    setActiveTab,
    setCounterSubTab,
    setSynergySubTab,
  };
};
