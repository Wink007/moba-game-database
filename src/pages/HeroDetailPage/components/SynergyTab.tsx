import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName } from '../../../utils/translation';
import { parseMaybeJson } from '../../../utils/parseMaybeJson';
import { CompatibilityHero } from '../../../types';
import { SynergyTabProps, CompatibilityData } from './interface';
import styles from '../styles.module.scss';

export const SynergyTab: React.FC<SynergyTabProps> = React.memo(({ hero, allHeroes, synergySubTab, setSynergySubTab }) => {
  const { t, i18n } = useTranslation();

  const findHeroByGameId = (heroId: number) =>
    allHeroes.find(h => h.hero_game_id === heroId) || allHeroes.find(h => h.id === heroId);

  const heroCompatibilityData = parseMaybeJson<CompatibilityData>(hero.compatibility_data);
  if (!heroCompatibilityData) {
    return (
      <div className={styles.contentSection}>
        <p className={styles.tabEmptyState}>{t('heroDetail.noSynergyData')}</p>
      </div>
    );
  }

  // TypeScript narrowing helper — heroCompatibilityData is non-null beyond this point
  const compatData = heroCompatibilityData as CompatibilityData;

  const renderComparison = (mates: CompatibilityHero[], isIncompatible: boolean) => {
    if (!mates || mates.length === 0) return null;
    const topMate = mates[0];
    const topMateId = topMate.heroid ?? topMate.hero_id;
    const mateHero = findHeroByGameId(topMateId);
    if (!mateHero) return null;

    const heroWinRateValue = compatData.main_hero_win_rate || 0.5;
    const heroWinRate = heroWinRateValue < 1 ? heroWinRateValue * 100 : heroWinRateValue;
    const teamWinRateValue = topMate.win_rate || 0;
    const teamWinRate = teamWinRateValue < 1 ? teamWinRateValue * 100 : teamWinRateValue;

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
            <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.rightAvatar} />
            <div className={styles.comparisonWinRate}>
              <span className={styles.winRateNumber}>{teamWinRate.toFixed(2)}%</span>
              <span className={styles.winRateLabel}>{t('heroDetail.winRate')}</span>
            </div>
          </div>
        </div>
        <p className={styles.comparisonDesc}>
          {isIncompatible ? t('heroDetail.teammateScoreLowDesc') : t('heroDetail.teammateScoreDesc')}
        </p>
      </>
    );
  };

  const renderList = (mates: CompatibilityHero[]) => {
    if (!mates) return null;
    return mates.slice(0, 5).map((mate: CompatibilityHero, idx: number) => {
      const mateId = mate.heroid ?? mate.hero_id;
      const mateHero = findHeroByGameId(mateId);
      if (!mateHero) return null;
      const increaseWinRate = mate.increase_win_rate != null
        ? (Math.abs(mate.increase_win_rate) < 1 ? Math.abs(mate.increase_win_rate) * 100 : Math.abs(mate.increase_win_rate))
        : 0;
      return (
        <Link
          key={mateId ?? mate.heroid}
          to={`/${hero.game_id}/heroes/${mateHero.id}`}
          className={styles.counterListItem}
        >
          <div className={styles.counterListRank}>{idx + 1}</div>
          <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.counterListImage} />
          <div className={styles.counterListInfo}>
            <span className={styles.counterListName}>{getHeroName(mateHero, i18n.language)}</span>
            <div className={styles.counterListBar}>
              <div className={styles.counterListBarFill} style={{ width: `${Math.min(increaseWinRate / 3 * 100, 100)}%` }} />
            </div>
          </div>
          <span className={styles.counterListScore}>{increaseWinRate.toFixed(2)}</span>
        </Link>
      );
    });
  };

  const compatible = compatData.compatible || [];
  const notCompatible = compatData.not_compatible || [];
  const compatibleItems = renderList(compatible) || [];
  const notCompatibleItems = renderList(notCompatible) || [];

  return (
    <div className={styles.contentSection}>
      <div className={styles.relationshipSection}>
        <h2 className={styles.relationshipMainTitle}>{t('heroDetail.compatibility')}</h2>
        <div className={styles.relationshipTabs}>
          <button
            className={`${styles.relationshipTab} ${synergySubTab === 'compatible' ? styles.relationshipTabActive : ''}`}
            onClick={() => setSynergySubTab('compatible')}
          >
            {t('heroDetail.compatibility')}
          </button>
          <button
            className={`${styles.relationshipTab} ${synergySubTab === 'incompatible' ? styles.relationshipTabActive : ''}`}
            onClick={() => setSynergySubTab('incompatible')}
          >
            {t('heroDetail.notCompatible')}
          </button>
        </div>

        <div className={styles.relationshipContent}>
          <div className={styles.comparisonBlock}>
            {synergySubTab === 'compatible' && renderComparison(compatible, false)}
            {synergySubTab === 'incompatible' && renderComparison(notCompatible, true)}
          </div>
          <div className={styles.counterList}>
            <div className={styles.counterListHeader}>
              <span>{synergySubTab === 'compatible' ? t('heroDetail.bestTeammates') : t('heroDetail.worstTeammates')}</span>
              <span>{t('heroDetail.teammateScore')}</span>
            </div>
            {synergySubTab === 'compatible' && (compatibleItems.filter(Boolean).length ? compatibleItems : <p className={styles.tabEmptyState}>{t('heroDetail.noSynergyData')}</p>)}
            {synergySubTab === 'incompatible' && (notCompatibleItems.filter(Boolean).length ? notCompatibleItems : <p className={styles.tabEmptyState}>{t('heroDetail.noSynergyData')}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
});
