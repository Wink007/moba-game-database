import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from '../../../utils/sanitize';
import { HistoryTabProps } from './interface';
import type { Patch, SkillChange } from '../../../types';
import styles from '../styles.module.scss';

export const HistoryTab: React.FC<HistoryTabProps> = React.memo(({ hero, heroPatches }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.contentSection}>
      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <div>
            <h2 className={styles.historySectionTitle}>{t('heroDetail.balanceHistory')}</h2>
            <p className={styles.historySectionDesc}>
              {t('heroDetail.balanceHistoryDesc', { hero: hero.name })}
            </p>
          </div>
          <Link to={`/${hero.game_id}/patches`} className={styles.viewAllPatchesBtn}>
            {t('heroDetail.viewAllPatches')}
          </Link>
        </div>

        {heroPatches.length > 0 ? (
          <div className={styles.patchesTimeline}>
            {heroPatches.map((patch: Patch) => {
              const heroChange = patch.hero_changes?.[hero.name];
              const heroAdjustment = patch.hero_adjustments?.[hero.name];

              if (!heroChange && !heroAdjustment) return null;

              return (
                <div key={patch.version} className={styles.patchCard}>
                  <div className={styles.patchHeader}>
                    <div className={styles.patchVersion}>
                      <span className={styles.patchVersionLabel}>{t('heroDetail.version')}</span>
                      <span className={styles.patchVersionNumber}>{patch.version}</span>
                    </div>
                    <div className={styles.patchDate}>
                      {new Date(patch.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Summary/Description */}
                  {(heroChange?.summary || heroAdjustment?.summary || heroAdjustment?.description) && (
                    <div className={styles.patchSummary}>
                      {heroChange?.summary && <p>{heroChange.summary}</p>}
                      {!heroChange?.summary && heroAdjustment?.summary && <p>{heroAdjustment.summary}</p>}
                      {!heroChange?.summary && !heroAdjustment?.summary && heroAdjustment?.description && (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(heroAdjustment.description) }} />
                      )}
                    </div>
                  )}

                  {/* Skills from any format */}
                  {(heroChange?.skills || heroAdjustment?.skills) && (heroChange?.skills || heroAdjustment?.skills)!.length > 0 && (
                    <div className={styles.skillChanges}>
                      {(heroChange?.skills || heroAdjustment?.skills)!.map((skill: SkillChange, idx: number) => (
                        <div key={idx} className={styles.skillChange}>
                          <div className={styles.skillHeader}>
                            <div className={styles.skillName}>
                              <span className={styles.skillType}>{skill.type}</span>
                              {skill.name && <span className={styles.skillNameText}>{skill.name}</span>}
                            </div>
                            {skill.balance && (
                              <span className={styles.balanceBadge} data-balance={skill.balance.toLowerCase()}>
                                {skill.balance}
                              </span>
                            )}
                          </div>
                          {skill.changes && skill.changes.length > 0 && (
                            <ul className={styles.changesList}>
                              {skill.changes.map((change: string, changeIdx: number) => (
                                <li key={changeIdx} className={styles.changeItem}>{change}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New format skill adjustments */}
                  {heroAdjustment?.adjustments && heroAdjustment.adjustments.length > 0 && (
                    <div className={styles.skillChanges}>
                      {heroAdjustment.adjustments.map((adj, idx) => (
                        <div key={idx} className={styles.skillChange}>
                          <div className={styles.skillHeader}>
                            <div className={styles.skillName}>
                              {adj.skill_name ? (
                                <span className={styles.skillNameText}>{adj.skill_name}</span>
                              ) : (
                                <span className={styles.skillType}>{adj.skill_type}</span>
                              )}
                            </div>
                            {adj.badge && (
                              <span className={styles.balanceBadge} data-balance={adj.badge.toLowerCase()}>
                                {adj.badge}
                              </span>
                            )}
                          </div>
                          <div className={styles.changesList}>
                            <div className={styles.changeItem} dangerouslySetInnerHTML={{ __html: sanitizeHtml(adj.description) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New format attribute adjustments */}
                  {heroAdjustment?.attribute_adjustments && heroAdjustment.attribute_adjustments.length > 0 && (
                    <div className={styles.skillChanges}>
                      {heroAdjustment.attribute_adjustments.map((adj, idx) => (
                        <div key={idx} className={styles.skillChange}>
                          <div className={styles.skillHeader}>
                            <div className={styles.skillName}>
                              <span className={styles.skillNameText}>{adj.attribute_name}</span>
                            </div>
                            {adj.badge && (
                              <span className={styles.balanceBadge} data-balance={adj.badge.toLowerCase()}>
                                {adj.badge}
                              </span>
                            )}
                          </div>
                          <div className={styles.changesList}>
                            <div className={styles.changeItem} dangerouslySetInnerHTML={{ __html: sanitizeHtml(adj.description) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.patchLink}>
                    <Link to={`/${hero.game_id}/patches/patch_${patch.version}#${hero.name}`}>
                      {t('heroDetail.viewFullPatchNotes')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noHistoryData}>
            <p>{t('heroDetail.noBalanceHistory')}</p>
          </div>
        )}
      </div>
    </div>
  );
});
