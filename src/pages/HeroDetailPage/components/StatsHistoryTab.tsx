import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles.module.scss';
import { StatCard } from './StatCard';
import { StatsHistorySkeleton } from './StatsHistorySkeleton';
import { useAllPeriodData } from '../hooks/useAllPeriodData';
import { RANK_OPTIONS } from '../constants';
import { StatsHistoryTabProps } from './interfaces';

export const StatsHistoryTab: React.FC<StatsHistoryTabProps> = React.memo(({ hero }) => {
  const { t } = useTranslation();
  const [rank, setRank] = useState('glory');
  const { points, allLoading } = useAllPeriodData(hero, rank);

  const hasData = points.length > 0;
  const latest = points[0] ?? null;
  const oldest = points[points.length - 1] ?? null;
  const trend = (key: 'win_rate' | 'ban_rate' | 'pick_rate') =>
    latest && oldest && points.length > 1 ? +(latest[key] - oldest[key]).toFixed(2) : null;

  return (
    <div className={styles.contentSection}>
      {/* Rank filter */}
      <div className={styles.statsHistoryFilters}>
        {RANK_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`${styles.statsHistoryRankBtn} ${rank === opt.value ? styles.statsHistoryRankBtnActive : ''}`}
            onClick={() => setRank(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {allLoading && <StatsHistorySkeleton />}

      {!allLoading && !hasData && (
        <p className={styles.tabEmptyState}>{t('statsHistory.noData')}</p>
      )}

      {!allLoading && hasData && (
        <>
          {/* 4-column table */}
          <div className={styles.statsHistoryTable}>
            <div className={styles.statsHistoryTableHeader}>
              <span>{t('statsHistory.period')}</span>
              <span>{t('statsHistory.wins')}</span>
              <span>{t('statsHistory.bans')}</span>
              <span>{t('statsHistory.picks')}</span>
            </div>
            {points.map(p => (
              <div key={p.period} className={styles.statsHistoryTableRow}>
                <span className={styles.statPeriod}>{p.period}d</span>
                <span className={styles.statWr}>{p.win_rate.toFixed(2)}%</span>
                <span className={styles.statBan}>{p.ban_rate.toFixed(2)}%</span>
                <span className={styles.statPick}>{p.pick_rate.toFixed(2)}%</span>
              </div>
            ))}
          </div>

          {/* Sparkline cards */}
          <div className={styles.shStatGrid}>
            <StatCard
              label={t('heroDetail.winRate')}
              value={latest?.win_rate ?? null}
              trend={trend('win_rate')}
              values={points.map(p => p.win_rate)}
              periods={points.map(p => p.period)}
              color="#4ade80"
            />
            <StatCard
              label={t('heroDetail.banRate')}
              value={latest?.ban_rate ?? null}
              trend={trend('ban_rate')}
              values={points.map(p => p.ban_rate)}
              periods={points.map(p => p.period)}
              color="#f87171"
            />
            <StatCard
              label={t('heroDetail.pickRate')}
              value={latest?.pick_rate ?? null}
              trend={trend('pick_rate')}
              values={points.map(p => p.pick_rate)}
              periods={points.map(p => p.period)}
              color="#60a5fa"
            />
          </div>
        </>
      )}
    </div>
  );
});
