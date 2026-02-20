import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabsNavigationProps } from './interface';
import styles from '../styles.module.scss';

export const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.tabsNavigation}>
      <button 
        className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabButtonActive : ''}`}
        onClick={() => onTabChange('info')}
      >
        {t('heroDetail.baseInformation')}
      </button>
      <button 
        className={`${styles.tabButton} ${activeTab === 'builds' ? styles.tabButtonActive : ''}`}
        onClick={() => onTabChange('builds')}
      >
        {t('heroDetail.proBuilds')}
      </button>
      <button 
        className={`${styles.tabButton} ${activeTab === 'counter' ? styles.tabButtonActive : ''}`}
        onClick={() => onTabChange('counter')}
      >
        {t('heroDetail.counters')}
      </button>
      <button 
        className={`${styles.tabButton} ${activeTab === 'synergy' ? styles.tabButtonActive : ''}`}
        onClick={() => onTabChange('synergy')}
      >
        {t('heroDetail.bestWith')}
      </button>
      <button 
        className={`${styles.tabButton} ${activeTab === 'about' ? styles.tabButtonActive : ''}`}
        onClick={() => onTabChange('about')}
      >
        {t('heroDetail.aboutTab')}
      </button>
      <button 
        className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`}
        onClick={() => onTabChange('history')}
      >
        {t('heroDetail.statsHistory')}
      </button>
    </div>
  );
};
