import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ProBuild } from '../../../types/hero';
import { Item } from '../../../types/item';
import { useItemsQuery } from '../../../queries/useItemsQuery';
import { useEmblems, useEmblemTalents } from '../../../hooks/useEmblems';
import type { Talent } from '../../../hooks/useEmblems';
import { API_URL } from '../../../config';
import styles from '../styles.module.scss';

interface BattleSpell {
  id: number;
  game_id: number;
  name: string;
  overview?: string;
  description?: string;
  cooldown?: number;
  unlocked_level?: number;
  icon_url?: string;
}

interface ProBuildsSectionProps {
  builds: ProBuild[];
  gameId: number;
}

const BUILDS_PER_PAGE = 5;

const RANK_CLASSES: Record<number, string> = {
  0: styles.pbRankGold,
  1: styles.pbRankSilver,
  2: styles.pbRankBronze,
};

export const ProBuildsSection: React.FC<ProBuildsSectionProps> = ({ builds, gameId }) => {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = React.useState(BUILDS_PER_PAGE);

  const { data: items = [], isLoading: itemsLoading } = useItemsQuery(gameId);
  const { data: emblems = [], isLoading: emblemsLoading } = useEmblems(String(gameId));
  const { tier1, tier2, tier3, isLoading: talentsLoading } = useEmblemTalents(String(gameId));
  const { data: spells = [], isLoading: spellsLoading } = useQuery<BattleSpell[]>({
    queryKey: ['battle-spells', gameId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/battle-spells?game_id=${gameId}`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  const isDataLoading = itemsLoading || emblemsLoading || talentsLoading || spellsLoading;

  const itemsMap = React.useMemo(() => {
    const map = new Map<number, Item>();
    items.forEach((item: Item) => map.set(item.id, item));
    return map;
  }, [items]);

  const spellsMap = React.useMemo(() => {
    const map = new Map<number, BattleSpell>();
    spells.forEach((spell) => map.set(spell.id, spell));
    return map;
  }, [spells]);

  const emblemsMap = React.useMemo(() => {
    const map = new Map<number, any>();
    emblems.forEach((emblem: any) => map.set(emblem.id, emblem));
    return map;
  }, [emblems]);

  const talentsMap = React.useMemo(() => {
    const map = new Map<string, Talent>();
    [...tier1, ...tier2, ...tier3].forEach((talent) => map.set(talent.name, talent));
    return map;
  }, [tier1, tier2, tier3]);

  const sortedBuilds = React.useMemo(() => {
    return [...builds].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [builds]);

  const visibleBuilds = sortedBuilds.slice(0, visibleCount);
  const hasMore = visibleCount < sortedBuilds.length;
  const remaining = sortedBuilds.length - visibleCount;

  if (!builds || builds.length === 0) {
    return (
      <div className={styles.noHistoryData}>
        <p>{t('heroDetail.noBuildsData')}</p>
      </div>
    );
  }

  if (isDataLoading) {
    return (
      <div className={styles.pbContainer}>
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className={styles.pbSkeletonCard}>
            <div className={styles.pbSkeletonHeader}>
              <div className={styles.pbSkeletonRank} />
              <div className={styles.pbSkeletonLikes} />
            </div>
            <div className={styles.pbSkeletonItemsRow}>
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className={styles.pbSkeletonArrow} />}
                  <div className={styles.pbSkeletonItem}>
                    <div className={styles.pbSkeletonItemIcon} />
                    <div className={styles.pbSkeletonItemLabel} />
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className={styles.pbSkeletonSetupRow}>
              <div className={styles.pbSkeletonSetupItem}>
                <div className={styles.pbSkeletonSetupIcon} />
                <div className={styles.pbSkeletonSetupLabel} />
              </div>
              <div className={styles.pbSkeletonSetupItem}>
                <div className={styles.pbSkeletonSetupIcon} />
                <div className={styles.pbSkeletonSetupLabel} />
              </div>
              <div className={styles.pbSkeletonSetupItem}>
                <div className={styles.pbSkeletonSetupIcon} />
                <div className={styles.pbSkeletonSetupLabel} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.pbContainer}>
      <div className={styles.pbCount}>
        {sortedBuilds.length} {sortedBuilds.length === 1 ? 'build' : 'builds'}
      </div>

      {visibleBuilds.map((build, idx) => {
        const spell = spellsMap.get(build.battle_spell_id);
        const emblem = emblemsMap.get(build.emblem_id);
        const isTop3 = idx < 3;
        const rankClass = RANK_CLASSES[idx] || '';

        return (
          <div
            key={idx}
            className={`${styles.pbCard} ${isTop3 ? styles.pbCardTop : ''} ${rankClass}`}
          >
            {/* Header: rank + likes */}
            <div className={styles.pbHeader}>
              <div className={`${styles.pbRank} ${rankClass}`}>
                {idx + 1}
              </div>
              <div className={styles.pbHeaderRight}>
                {build.likes != null && build.likes > 0 && (
                  <div className={styles.pbLikes}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 20h2V8H2v12zm22-11a2 2 0 00-2-2h-6.31l.95-4.57.03-.32a1.49 1.49 0 00-.44-1.06L15.17 0 7.59 7.59C7.22 7.95 7 8.45 7 9v10a2 2 0 002 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73V9z" />
                    </svg>
                    {build.likes}
                  </div>
                )}
              </div>
            </div>

            {/* Items chain */}
            <div className={styles.pbItemsRow}>
              {build.core_items.map((itemId, iIdx) => {
                const item = itemsMap.get(itemId);
                return (
                  <React.Fragment key={iIdx}>
                    {iIdx > 0 && <span className={styles.pbItemArrow}>›</span>}
                    <div className={styles.pbItem} title={item?.name || `Item #${itemId}`}>
                      {item?.icon_url ? (
                        <img src={item.icon_url} alt={item.name} className={styles.pbItemImg} loading="lazy" />
                      ) : (
                        <div className={styles.pbItemEmpty}>{iIdx + 1}</div>
                      )}
                      <span className={styles.pbItemLabel}>{item?.name || '???'}</span>
                    </div>
                  </React.Fragment>
                );
              })}

              {build.optional_items && build.optional_items.length > 0 && (
                <>
                  <span className={styles.pbItemDivider}>|</span>
                  {build.optional_items.map((itemId, iIdx) => {
                    const item = itemsMap.get(itemId);
                    return (
                      <div key={`opt-${iIdx}`} className={`${styles.pbItem} ${styles.pbItemOptional}`} title={item?.name || `Item #${itemId}`}>
                        {item?.icon_url ? (
                          <img src={item.icon_url} alt={item?.name || ''} className={styles.pbItemImg} loading="lazy" />
                        ) : (
                          <div className={styles.pbItemEmpty}>{iIdx + 1}</div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Setup: spell + emblem + talents */}
            <div className={styles.pbSetupRow}>
              {spell && (
                <div className={styles.pbSetupGroup}>
                  <span className={styles.pbSetupGroupLabel}>Spell</span>
                  <div className={styles.pbSetupItem}>
                    {spell.icon_url && (
                      <img src={spell.icon_url} alt={spell.name} className={styles.pbSetupIcon} loading="lazy" />
                    )}
                    <span className={styles.pbSetupLabel}>{spell.name}</span>
                  </div>
                </div>
              )}

              {(emblem || (build.emblem_talents && build.emblem_talents.length > 0)) && (
                <>
                  {spell && <span className={styles.pbSetupDivider} />}
                  <div className={styles.pbSetupGroup}>
                    <span className={styles.pbSetupGroupLabel}>Emblem</span>
                    <div className={styles.pbSetupGroupItems}>
                      {emblem && (
                        <div className={`${styles.pbSetupItem} ${styles.pbSetupItemEmblem}`}>
                          {emblem.icon_url && (
                            <img src={emblem.icon_url} alt={emblem.name} className={styles.pbSetupIcon} loading="lazy" />
                          )}
                          <span className={styles.pbSetupLabel}>{emblem.name}</span>
                        </div>
                      )}
                      {build.emblem_talents && build.emblem_talents.map((name, tIdx) => {
                        const td = talentsMap.get(name);
                        return (
                          <div key={tIdx} className={styles.pbSetupItem}>
                            {td?.icon_url && (
                              <img src={td.icon_url} alt={name} className={styles.pbSetupIcon} loading="lazy" />
                            )}
                            <span className={styles.pbSetupLabel}>{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          className={styles.pbShowMore}
          onClick={() => setVisibleCount((prev) => prev + BUILDS_PER_PAGE)}
        >
          Show more ({remaining > BUILDS_PER_PAGE ? BUILDS_PER_PAGE : remaining} of {remaining})
        </button>
      )}
    </div>
  );
};
