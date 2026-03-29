import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoTabProps } from './interface';
import styles from '../styles.module.scss';
import { CollapsibleSection } from './CollapsibleSection';
import { LaneMap } from './LaneMap';
import { MetaOverview } from './MetaOverview';

export const InfoTab: React.FC<InfoTabProps> = React.memo(({ hero, abilitiesLabel, getRatingLevel, allHeroes = [], counterData, compatibilityData }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.contentSection}>
      {/* Meta Overview */}
      <MetaOverview
        hero={hero}
        allHeroes={allHeroes}
        counterData={counterData}
        compatibilityData={compatibilityData}
      />

      {/* Performance Ratings */}
      {(hero.main_hero_appearance_rate || hero.main_hero_ban_rate || hero.main_hero_win_rate) && (
        <div className={styles.performanceRatings}>
          <CollapsibleSection title={t('heroDetail.performanceStats')}>
            <div className={styles.ratingsGrid}>
              {hero.main_hero_appearance_rate && (
                <div className={styles.ratingCard}>
                  <div className={styles.ratingCardHeader}>
                    <span className={styles.ratingCardName}>{t('heroDetail.pickShort')}</span>
                    <span className={styles.ratingCardValue}>{hero.main_hero_appearance_rate.toFixed(2)}%</span>
                  </div>
                  <div className={styles.ratingBar}>
                    <div
                      className={styles.ratingBarFill}
                      style={{ width: `${Math.min(hero.main_hero_appearance_rate, 100)}%` }}
                      data-level={getRatingLevel(hero.main_hero_appearance_rate).color}
                    />
                  </div>
                  <span className={styles.ratingCardDescription}>{t('heroDetail.pickFrequency')}</span>
                </div>
              )}

              {hero.main_hero_ban_rate && (
                <div className={styles.ratingCard}>
                  <div className={styles.ratingCardHeader}>
                    <span className={styles.ratingCardName}>{t('heroDetail.banShort')}</span>
                    <span className={styles.ratingCardValue}>{hero.main_hero_ban_rate.toFixed(2)}%</span>
                  </div>
                  <div className={styles.ratingBar}>
                    <div
                      className={styles.ratingBarFill}
                      style={{ width: `${Math.min(hero.main_hero_ban_rate, 100)}%` }}
                      data-level={getRatingLevel(hero.main_hero_ban_rate).color}
                    />
                  </div>
                  <span className={styles.ratingCardDescription}>{t('heroDetail.howOftenBanned')}</span>
                </div>
              )}

              {hero.main_hero_win_rate && (
                <div className={styles.ratingCard}>
                  <div className={styles.ratingCardHeader}>
                    <span className={styles.ratingCardName}>{t('heroDetail.winShort')}</span>
                    <span className={styles.ratingCardValue}>{hero.main_hero_win_rate.toFixed(2)}%</span>
                  </div>
                  <div className={styles.ratingBar}>
                    <div
                      className={styles.ratingBarFill}
                      style={{ width: `${Math.min(hero.main_hero_win_rate, 100)}%` }}
                      data-level={getRatingLevel(hero.main_hero_win_rate).color}
                    />
                  </div>
                  <span className={styles.ratingCardDescription}>{t('heroDetail.gamesWonPercentage')}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Stats Table */}
      <CollapsibleSection title={t('heroDetail.baseStats')}>
        <div className={styles.statsTable}>
          <div className={styles.statsTableRow}>
            <div className={styles.statsTableCell}>
              <span className={styles.statName}>{t('heroDetail.physicalAttack')}</span>
              <span className={styles.statValueLarge}>{hero.hero_stats?.physical_attack || '0'}</span>
            </div>
            <div className={styles.statsTableCell}>
              <span className={styles.statName}>{t('heroDetail.physicalDefense')}</span>
              <span className={styles.statValueLarge}>{hero.hero_stats?.physical_defense || '0'}</span>
            </div>
          </div>
          <div className={styles.statsTableRow}>
            <div className={styles.statsTableCell}>
              <span className={styles.statName}>{t('heroDetail.magicPower')}</span>
              <span className={styles.statValueLarge}>{hero.hero_stats?.magic_power ?? '0'}</span>
            </div>
            <div className={styles.statsTableCell}>
              <span className={styles.statName}>{t('heroDetail.magicDefense')}</span>
              <span className={styles.statValueLarge}>{hero.hero_stats?.magic_defense || '0'}</span>
            </div>
          </div>
          <div className={styles.statsTableRow}>
            <div className={styles.statsTableCell}>
              <span className={styles.statName}>{t('heroDetail.attackSpeed')}</span>
              <span className={styles.statValueLarge}>{hero.hero_stats?.attack_speed || '0'}</span>
            </div>
            <div className={styles.statsTableCell}>
              <span className={styles.statName}>{t('heroDetail.movementSpeed')}</span>
              <span className={styles.statValueLarge}>{hero.hero_stats?.movement_speed || '0'}</span>
            </div>
          </div>
          {hero.hero_stats?.attack_speed_ratio && (
            <div className={styles.statsTableRow}>
              <div className={`${styles.statsTableCell} ${styles.fullWidthCell}`}>
                <span className={styles.statName}>{t('heroDetail.attackSpeedRatio')}</span>
                <span className={styles.statValueLarge}>{hero.hero_stats.attack_speed_ratio}</span>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Ability Ratings */}
      {hero.abilityshow && hero.abilityshow.length > 0 && (
        <div className={styles.abilityShow}>
          <CollapsibleSection title={t('heroDetail.abilityRatings')}>
            <div className={styles.abilityShowGrid}>
              {hero.abilityshow.map((rating, idx) => (
                <div key={idx} className={styles.abilityShowItem}>
                  <div className={styles.abilityShowLabel}>{abilitiesLabel[idx]}</div>
                  <div className={styles.abilityShowBarWrapper}>
                    <div className={styles.abilityShowBar}>
                      <div
                        className={styles.abilityShowFill}
                        style={{ width: `${rating}%` }}
                      />
                    </div>
                    <span className={styles.abilityShowValue}>{rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Lane Position Map */}
      {hero.lane && hero.lane.length > 0 && (
        <div className={styles.laneMapSection}>
          <CollapsibleSection title={t('heroDetail.lanePosition', 'Lane Position')}>
            <LaneMap
              lanes={hero.lane}
            />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
});
