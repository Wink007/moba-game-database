import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MlbbSortKey, MlbbStatsProps } from '../types';
import { MlbbHeroCard } from './MlbbHeroCard';
import styles from '../styles.module.scss';

export const MlbbStats: React.FC<MlbbStatsProps> = ({ stats, seasons, heroes, season, onSeasonChange }) => {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<MlbbSortKey>('total_games');
  const [sortAsc, setSortAsc] = useState(false);
  const [visible, setVisible] = useState(10);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (heroId: number) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(heroId) ? next.delete(heroId) : next.add(heroId);
    return next;
  });

  const sorted = useMemo(() => [...stats].sort((a, b) => {
    const v = (a[sortKey] ?? 0) as number;
    const w = (b[sortKey] ?? 0) as number;
    return sortAsc ? v - w : w - v;
  }), [stats, sortKey, sortAsc]);

  return (
    <div className={styles.mlbbStats}>
      <div className={styles.mlbbStatsHeader}>
        <span className={styles.mlbbStatsTitle}>
          {t('profile.mlbbHeroStats')}
          <span className={styles.mlbbStatsCount}>{stats.length}</span>
        </span>
      </div>

      <div className={styles.mlbbControls}>
        {seasons.length > 0 && (
          <div className={styles.mlbbSeasonSelect}>
            <select
              className={styles.mlbbSeasonDropdown}
              value={season}
              onChange={e => { onSeasonChange(Number(e.target.value)); setVisible(10); }}
            >
              <option value={0}>{t('profile.mlbbAllTime')}</option>
              {seasons.map(s => <option key={s} value={s}>S{s}</option>)}
            </select>
            <svg className={styles.mlbbSeasonChevron} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
          </div>
        )}
        <div className={styles.mlbbSeasonSelect}>
          <select
            className={styles.mlbbSeasonDropdown}
            value={sortKey}
            onChange={e => { setSortKey(e.target.value as MlbbSortKey); setSortAsc(false); }}
          >
            <option value="total_games">{t('profile.mlbbSortGames')}</option>
            <option value="win_rate">{t('profile.mlbbSortWR')}</option>
            <option value="kda">{t('profile.mlbbSortKDA')}</option>
            <option value="avg_kills">{t('profile.mlbbSortKills')}</option>
            <option value="mvp">{t('profile.mlbbSortMVP')}</option>
          </select>
          <svg className={styles.mlbbSeasonChevron} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
        </div>
        <button className={styles.mlbbSortDirBtn} onClick={() => setSortAsc(v => !v)}>
          {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      <div className={styles.mlbbCardList}>
        {sorted.slice(0, visible).map(stat => {
          const hero = heroes.find((h: any) => h.hero_game_id === stat.hero_id);
          return (
            <MlbbHeroCard
              key={stat.hero_id}
              stat={stat}
              hero={hero}
              isExpanded={expanded.has(stat.hero_id)}
              onToggle={() => toggle(stat.hero_id)}
            />
          );
        })}
      </div>

      {visible < sorted.length && (
        <button className={styles.mlbbLoadMore} onClick={() => setVisible(v => v + 10)}>
          {t('profile.mlbbShowMore', { count: Math.min(10, sorted.length - visible) })}
          <span className={styles.mlbbLoadMoreCount}>{t('profile.mlbbRemaining', { count: sorted.length - visible })}</span>
        </button>
      )}
    </div>
  );
};
