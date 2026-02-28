import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { getHeroName } from '../../utils/translation';
import type { Hero } from '../../types';
import type { SingleResultsData } from './types';
import { ShieldIcon, SwordIcon } from './icons';
import styles from './styles.module.scss';

interface SingleResultsProps {
  hero: Hero;
  results: SingleResultsData;
  lang: string;
  gameId: number;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const SingleResults: React.FC<SingleResultsProps> = memo(({ hero, results, lang, gameId, t }) => {
  const [subTab, setSubTab] = useState<'counters' | 'strong'>('counters');
  const list = subTab === 'counters' ? results.mostCounteredBy : results.bestCounters;

  return (
    <div className={styles.resultsSection}>
      <Link to={`/${gameId}/heroes/${hero.id}`} className={styles.resultsHeader}>
        <img
          src={hero.head || hero.image}
          alt={getHeroName(hero, lang)}
          className={styles.resultsHeroImg}
        />
        <div>
          <h2 className={styles.resultsHeroName}>{getHeroName(hero, lang)}</h2>
          {results.mainWinRate && (
            <span className={styles.resultsWinRate}>
              {t('counterPick.winRate')}: {results.mainWinRate.toFixed(1)}%
            </span>
          )}
        </div>
      </Link>

      <div className={styles.subTabs}>
        <button
          className={`${styles.subTab} ${subTab === 'counters' ? styles.subTabActive : ''}`}
          onClick={() => setSubTab('counters')}
        >
          <ShieldIcon />
          {t('counterPick.countersHim')}
        </button>
        <button
          className={`${styles.subTab} ${subTab === 'strong' ? styles.subTabActive : ''}`}
          onClick={() => setSubTab('strong')}
        >
          <SwordIcon />
          {t('counterPick.strongAgainst')}
        </button>
      </div>

      <p className={styles.subTabDesc}>
        {subTab === 'counters'
          ? t('counterPick.countersHimDesc', { hero: getHeroName(hero, lang) })
          : t('counterPick.strongAgainstDesc', { hero: getHeroName(hero, lang) })
        }
      </p>

      <div className={styles.counterList}>
        {list.slice(0, 10).map((counter, idx) => (
          <Link
            key={counter.heroid}
            to={`/${gameId}/heroes/${counter.hero!.id}`}
            className={styles.counterItem}
          >
            <span className={styles.counterRank}>#{idx + 1}</span>
            <img
              src={counter.hero!.head || counter.hero!.image}
              alt={getHeroName(counter.hero!, lang)}
              className={styles.counterImg}
            />
            <div className={styles.counterInfo}>
              <span className={styles.counterName}>{getHeroName(counter.hero!, lang)}</span>
              <div className={styles.counterBar}>
                <div
                  className={styles.counterBarFill}
                  style={{ width: `${Math.min(Math.abs(counter.increaseWinRate) / 5 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className={styles.counterStats}>
              <span className={styles.counterScore}>{counter.increaseWinRate > 0 ? '+' : ''}{counter.increaseWinRate.toFixed(1)}%</span>
              {counter.winRate != null && !isNaN(counter.winRate) && (
                <span className={styles.counterWr}>{counter.winRate.toFixed(1)}% WR</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});

SingleResults.displayName = 'SingleResults';
