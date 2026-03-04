import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName } from '../../../utils/translation';
import { parseMaybeJson } from '../../../utils/parseMaybeJson';
import { CompatibilityHero } from '../../../types';
import { SynergyTabProps, CompatibilityData } from './interface';
import { LazyImage } from '../../../components/LazyImage';
import styles from '../styles.module.scss';

const MIN_SKELETON_MS = 600;

const renderSynergySkeletonList = (styles: Record<string, string>) =>
  Array.from({ length: 5 }, (_, i) => (
    <div key={i} className={styles.counterListItemSkeleton}>
      <div className={`${styles.skeletonPulse} ${styles.skeletonRankItem}`} />
      <div className={`${styles.skeletonPulse} ${styles.skeletonAvatarItem}`} />
      <div className={styles.skeletonInfoItem}>
        <div className={`${styles.skeletonPulse} ${styles.skeletonNameItem}`} />
        <div className={`${styles.skeletonPulse} ${styles.skeletonBarItem}`} />
      </div>
      <div className={`${styles.skeletonPulse} ${styles.skeletonScoreItem}`} />
    </div>
  ));

export const SynergyTab: React.FC<SynergyTabProps> = React.memo(({ hero, allHeroes, synergySubTab, setSynergySubTab, isLoading, compatibilityData: compatibilityDataProp }) => {
  const { t, i18n } = useTranslation();

  // Guarantee skeleton is visible for at least MIN_SKELETON_MS on every mount
  const mountTimeRef = useRef(Date.now());
  const [skeletonVisible, setSkeletonVisible] = useState(true);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    setSkeletonVisible(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);
      const t = setTimeout(() => setSkeletonVisible(false), remaining);
      return () => clearTimeout(t);
    } else {
      setSkeletonVisible(true);
    }
  }, [isLoading]);

  const findHeroByGameId = (heroId: number) =>
    allHeroes.find(h => h.hero_game_id === heroId) || allHeroes.find(h => h.id === heroId);

  if (skeletonVisible) {
    return (
      <div className={styles.contentSection}>
        <div className={styles.counterList}>
          {renderSynergySkeletonList(styles)}
        </div>
      </div>
    );
  }

  const heroCompatibilityData = compatibilityDataProp ?? parseMaybeJson<CompatibilityData>(hero.compatibility_data);
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
    const teamWinRateValue = topMate.win_rate || mateHero?.main_hero_win_rate || 0;
    const teamWinRate = teamWinRateValue < 1 ? teamWinRateValue * 100 : teamWinRateValue;

    return (
      <>
        <div className={styles.heroComparison}>
          <div className={`${styles.heroComparisonSide} ${styles.left}`}>
            <LazyImage src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} wrapperStyle={{ borderRadius: '50%' }} />
            <div className={styles.comparisonWinRate}>
              <span className={styles.winRateNumber}>{heroWinRate.toFixed(2)}%</span>
              <span className={styles.winRateLabel}>{t('heroDetail.winRate')}</span>
            </div>
          </div>
          <div className={styles.heroComparisonDivider}></div>
          <div className={`${styles.heroComparisonSide} ${styles.right}`}>
            <LazyImage src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.rightAvatar} wrapperStyle={{ borderRadius: '50%' }} />
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
          <LazyImage src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.counterListImage} wrapperStyle={{ borderRadius: '8px' }} />
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

  const renderMobileGrid = () => {
    const renderGridHeroes = (heroes: CompatibilityHero[], isPositive: boolean) =>
      heroes.slice(0, 5).map((mate) => {
        const id = mate.heroid ?? mate.hero_id;
        const h = findHeroByGameId(id);
        if (!h) return null;
        const raw = mate.increase_win_rate != null ? Math.abs(mate.increase_win_rate) : 0;
        const delta = raw < 1 ? raw * 100 : raw;
        return (
          <Link key={id} to={`/${hero.game_id}/heroes/${h.id}`} className={styles.mobileGridHero}>
            <LazyImage src={h.head || h.image} alt={h.name} className={styles.mobileGridAvatar} wrapperStyle={{ borderRadius: '50%' }} />
            <span className={`${styles.mobileGridScore} ${isPositive ? styles.mobileGridScorePos : styles.mobileGridScoreNeg}`}>
              {isPositive ? '+' : '-'}{delta.toFixed(1)}
            </span>
          </Link>
        );
      });

    return (
      <div className={styles.mobileCounterCards}>
        <div className={styles.mobileCounterCard}>
          <div className={styles.mobileCardHeader}>
            <span>{t('heroDetail.notCompatible')}</span>
          </div>
          <div className={styles.mobileGridHeroes}>
            {renderGridHeroes(notCompatible, false)}
          </div>
        </div>
        <div className={styles.mobileCounterCard}>
          <div className={styles.mobileCardHeader}>
            <span>{t('heroDetail.compatibility')}</span>
          </div>
          <div className={styles.mobileGridHeroes}>
            {renderGridHeroes(compatible, true)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.contentSection}>
      <div className={styles.mobileComparisonBlock}>
        {renderComparison(compatible, false)}
      </div>
      {renderMobileGrid()}
      <div className={`${styles.relationshipSection} ${styles.desktopCounterContent}`}>
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
