import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName } from '../../../utils/translation';
import { parseMaybeJson } from '../../../utils/parseMaybeJson';
import { CounterHero } from '../../../types';
import { CounterTabProps, CounterData } from './interface';
import styles from '../styles.module.scss';

export const CounterTab: React.FC<CounterTabProps> = React.memo(({ hero, allHeroes, counterSubTab, setCounterSubTab }) => {
  const { t, i18n } = useTranslation();

  const findHeroByGameId = (heroId: number) =>
    allHeroes.find(h => h.hero_game_id === heroId) || allHeroes.find(h => h.id === heroId);

  const heroCounterData = parseMaybeJson<CounterData>(hero.counter_data);
  if (!heroCounterData) return null;

  const bestCounters = heroCounterData.best_counters || heroCounterData.counters || [];
  const mostCounteredBy = heroCounterData.most_countered_by || heroCounterData.allies || [];

  const renderComparison = (counterHeroes: CounterHero[], isWorst: boolean) => {
    if (counterHeroes.length === 0) return null;
    const topCounter = counterHeroes[0];
    const counterHeroId = topCounter.heroid ?? topCounter.hero_id;
    const counterHero = findHeroByGameId(counterHeroId);
    if (!counterHero) return null;

    const heroWinRateValue = heroCounterData.main_hero_win_rate || 0.5;
    const heroWinRate = heroWinRateValue < 1 ? heroWinRateValue * 100 : heroWinRateValue;
    const counterWinRateValue = topCounter.win_rate || 0;
    const counterWinRate = counterWinRateValue < 1 ? counterWinRateValue * 100 : counterWinRateValue;

    return (
      <>
        <div className={styles.heroComparison}>
          <div className={`${styles.heroComparisonSide} ${styles.left}`}>
            <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
            <div className={styles.comparisonWinRate}>
              <span className={styles.winRateNumber}>{heroWinRate.toFixed(2)}%</span>
              <span className={styles.winRateLabel}>{t('heroDetail.winRate')}</span>
            </div>
          </div>
          <div className={styles.heroComparisonDivider}></div>
          <div className={`${styles.heroComparisonSide} ${styles.right}`}>
            <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.rightAvatar} />
            <div className={styles.comparisonWinRate}>
              <span className={styles.winRateNumber}>{counterWinRate.toFixed(2)}%</span>
              <span className={styles.winRateLabel}>{t('heroDetail.winRate')}</span>
            </div>
          </div>
        </div>
        <p className={styles.comparisonDesc}>
          {isWorst
            ? t('heroDetail.strugglesAgainst', { hero: hero.name })
            : t('heroDetail.counterComparisonDesc')}
        </p>
      </>
    );
  };

  const renderList = (counterHeroes: CounterHero[], isBest: boolean) => {
    return counterHeroes.slice(0, 5).map((counter: CounterHero, idx: number) => {
      const counterHeroId = counter.heroid ?? counter.hero_id;
      const counterHero = findHeroByGameId(counterHeroId);
      if (!counterHero) return null;
      const raw = counter.increase_win_rate != null ? Math.abs(counter.increase_win_rate) : 0;
      const increaseWinRate = isBest
        ? (raw < 1 ? raw * 100 : raw)
        : (raw !== 0 && raw < 1 ? raw * 100 : raw);
      return (
        <Link
          key={counterHeroId}
          to={`/${hero.game_id}/heroes/${counterHero.id}`}
          className={styles.counterListItem}
        >
          <div className={styles.counterListRank}>{idx + 1}</div>
          <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.counterListImage} />
          <div className={styles.counterListInfo}>
            <span className={styles.counterListName}>{getHeroName(counterHero, i18n.language)}</span>
            <div className={styles.counterListBar}>
              <div className={styles.counterListBarFill} style={{ width: `${Math.min(increaseWinRate / 3 * 100, 100)}%` }} />
            </div>
          </div>
          <span className={styles.counterListScore}>{increaseWinRate.toFixed(2)}</span>
        </Link>
      );
    });
  };

  return (
    <div className={styles.contentSection}>
      <div className={styles.relationshipSection}>
        <h2 className={styles.relationshipMainTitle}>{t('heroDetail.counterRelationship')}</h2>
        <div className={styles.relationshipTabs}>
          <button
            className={`${styles.relationshipTab} ${counterSubTab === 'best' ? styles.relationshipTabActive : ''}`}
            onClick={() => setCounterSubTab('best')}
          >
            {t('heroDetail.bestCounters')}
          </button>
          <button
            className={`${styles.relationshipTab} ${counterSubTab === 'worst' ? styles.relationshipTabActive : ''}`}
            onClick={() => setCounterSubTab('worst')}
          >
            {t('heroDetail.mostCounteredBy')}
          </button>
        </div>

        <div className={styles.relationshipContent}>
          <div className={styles.comparisonBlock}>
            {counterSubTab === 'best' && renderComparison(bestCounters, false)}
            {counterSubTab === 'worst' && renderComparison(mostCounteredBy, true)}
          </div>
          <div className={styles.counterList}>
            <div className={styles.counterListHeader}>
              <span>{counterSubTab === 'best' ? t('heroDetail.bestCounters') : t('heroDetail.counteredBy')}</span>
              <span>{t('heroDetail.counterScore')}</span>
            </div>
            {counterSubTab === 'best' && renderList(bestCounters, true)}
            {counterSubTab === 'worst' && renderList(mostCounteredBy, false)}
          </div>
        </div>
      </div>
    </div>
  );
});
