import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { getHeroName } from '../../utils/translation';
import type { AggregatedCounter } from './types';
import { ChevronIcon } from './icons';
import styles from './styles.module.scss';

interface TeamResultsProps {
  results: AggregatedCounter[];
  lang: string;
  gameId: number;
  t: (key: string, options?: Record<string, unknown>) => string;
  enemyCount: number;
}

export const TeamResults: React.FC<TeamResultsProps> = memo(({ results, lang, gameId, t, enemyCount }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className={styles.resultsSection}>
      <div className={styles.teamResultsHeader}>
        <h2>{t('counterPick.bestPicks')}</h2>
        <p>{t('counterPick.bestPicksDesc', { count: enemyCount })}</p>
      </div>

      <div className={styles.counterList}>
        {results.map((item, idx) => (
          <div key={item.heroId} className={styles.teamCounterItem}>
            <div className={styles.teamCounterRow}>
              <Link
                to={`/${gameId}/heroes/${item.hero.id}`}
                className={styles.counterItem}
              >
                <span className={styles.counterRank}>#{idx + 1}</span>
                <img
                  src={item.hero.head || item.hero.image}
                  alt={getHeroName(item.hero, lang)}
                  className={styles.counterImg}
                />
                <div className={styles.counterInfo}>
                  <span className={styles.counterName}>{getHeroName(item.hero, lang)}</span>
                  <div className={styles.counterRoles}>
                    {item.hero.roles?.map(r => (
                      <span key={r} className={styles.roleTag}>{r}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.counterStats}>
                  <span className={styles.counterScore}>{item.totalScore > 0 ? '+' : ''}{item.totalScore.toFixed(1)}%</span>
                  <span className={styles.counterWr}>
                    {t('counterPick.avgWr')}: {item.avgWinRate.toFixed(1)}%
                  </span>
                </div>
              </Link>
              <button
                className={`${styles.expandBtn} ${expandedId === item.heroId ? styles.expandBtnOpen : ''}`}
                onClick={() => setExpandedId(expandedId === item.heroId ? null : item.heroId)}
                aria-label="Toggle details"
              >
                <ChevronIcon />
              </button>
            </div>
            {expandedId === item.heroId && (
              <div className={styles.detailsPanel}>
                {item.details.map(d => (
                  <div key={(d.enemyHero.hero_game_id ?? d.enemyHero.id)} className={styles.detailRow}>
                    <img
                      src={d.enemyHero.head || d.enemyHero.image}
                      alt={getHeroName(d.enemyHero, lang)}
                      className={styles.detailImg}
                    />
                    <span className={styles.detailName}>vs {getHeroName(d.enemyHero, lang)}</span>
                    <span className={styles.detailScore}>{d.increaseWinRate > 0 ? '+' : ''}{d.increaseWinRate.toFixed(1)}%</span>
                    <span className={styles.detailWr}>{d.winRate.toFixed(1)}% WR</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className={styles.noResults}>
          <p>{t('counterPick.noResults')}</p>
        </div>
      )}
    </div>
  );
});

TeamResults.displayName = 'TeamResults';
