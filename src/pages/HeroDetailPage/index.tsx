import { useParams } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getHeroName, getHeroFullDescription } from '../../utils/translation';
import { useHeroQuery, useHeroSkillsQuery, useHeroCounterDataQuery, useHeroCompatibilityDataQuery, useHeroesQuery } from '../../queries/useHeroesQuery';
import { usePatchesQuery } from '../../queries/usePatchesQuery';
import { Loader } from '../../components/Loader';
import { HeroSidebar } from './components/HeroSidebar';
import { TabsNavigation } from './components/TabsNavigation';
import { SkillsSection } from './components/SkillsSection';
import { ProBuildsSection } from './components/ProBuildsSection';
import { CommunityBuildsSection } from './components/CommunityBuildsSection';
import { useHeroSkills } from './hooks/useHeroSkills';
import { useHeroTabs } from './hooks/useHeroTabs';
import { useSEO } from '../../hooks/useSEO';
import { useAuthStore } from '../../store/authStore';
import styles from './styles.module.scss';
import type { Patch } from '../../types';

function HeroDetailPage() {
  const { t, i18n } = useTranslation();
  const { heroId } = useParams();
  const { data: hero, isLoading: heroLoading, isError: heroError } = useHeroQuery(Number(heroId));
  const { data: skills = [], isLoading: skillsLoading } = useHeroSkillsQuery(Number(heroId));
  const { data: allHeroes = [] } = useHeroesQuery(hero?.game_id || 0);
  useHeroCounterDataQuery(hero?.game_id || 0);
  useHeroCompatibilityDataQuery(hero?.game_id || 0);
  const { data: patches = [] } = usePatchesQuery();
  
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  
  const { activeTab, counterSubTab, synergySubTab, setActiveTab, setCounterSubTab, setSynergySubTab } = useHeroTabs();
  const [buildsSubTab, setBuildsSubTab] = React.useState<'builds' | 'my'>('builds');
  const { user } = useAuthStore();

  // Reset to 'builds' sub-tab when user logs out
  React.useEffect(() => {
    if (!user && buildsSubTab === 'my') {
      setBuildsSubTab('builds');
    }
  }, [user, buildsSubTab]);
  
  useSEO({
    title: hero ? `${hero.name} — Hero Guide` : 'Hero',
    description: hero ? `${hero.name} guide — skills, builds, counters and stats for Mobile Legends.` : undefined,
  });
  
  const {
    displaySkills,
    selectedSkill,
    maxTransforms,
    transformIndex,
    changedIndices,
    cycleTransform,
    setSelectedSkillIndex,
  } = useHeroSkills(skills);
  
  const [selectedSkillIndex, setSkillIndex] = React.useState(0);

  const parseMaybeJson = <T,>(value: unknown): T | null => {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    if (typeof value === 'object') return value as T;
    return null;
  };

  // counter_data/compatibility_data use Moonton's heroid (hero_game_id), not our internal DB id
  const findHeroByGameId = (heroId: number) =>
    allHeroes.find(h => h.hero_game_id === heroId) || allHeroes.find(h => h.id === heroId);
  
  const handleSkillSelect = (index: number) => {
    setSkillIndex(index);
    setSelectedSkillIndex(index);
  };
  
  // Filter patches containing changes for this hero
  const heroPatches = React.useMemo(() => {
    if (!hero || !patches) return [];
    return patches.filter((patch: Patch) => 
      (patch.hero_changes && patch.hero_changes[hero.name]) ||
      (patch.hero_adjustments && patch.hero_adjustments[hero.name])
    );
  }, [patches, hero]);

  // Ability labels
  const abilitiesLabel = [
    t('heroDetail.durability'),
    t('heroDetail.offense'),
    t('heroDetail.abilityEffects'),
    t('heroDetail.difficulty')
  ];

  // Helper function to get rating level
  const getRatingLevel = (rate: number): { level: string; color: string } => {
    if (rate >= 60) return { level: t('heroDetail.ratingVeryHigh'), color: 'high' };
    if (rate >= 40) return { level: t('heroDetail.ratingHigh'), color: 'medium-high' };
    if (rate >= 20) return { level: t('heroDetail.ratingAverage'), color: 'medium' };
    return { level: t('heroDetail.ratingLow'), color: 'low' };
  };

  if (heroLoading || skillsLoading) return <Loader />;
  if (heroError || !hero) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{t('heroDetail.notFound')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <HeroSidebar hero={hero} />

        <div className={styles.heroMainContent}>
          {/* Hero Background Image */}
          {(hero.painting || hero.image) && (
            <div className={styles.heroBackgroundImage}>
              <img 
                src={hero.painting || hero.image} 
                alt={hero.name} 
              />
            </div>
          )}

          <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Base Information Tab */}
            {activeTab === 'info' && (
              <div className={styles.contentSection}>
                {/* Performance Ratings */}
                {(hero.main_hero_appearance_rate || hero.main_hero_ban_rate || hero.main_hero_win_rate) && (
                  <div className={styles.performanceRatings}>
                    <h3 className={styles.sectionTitle}>{t('heroDetail.performanceStats')}</h3>
                    <div className={styles.ratingsGrid}>
                      {/* Appearance Rate */}
                      {hero.main_hero_appearance_rate && (
                        <div className={styles.ratingCard}>
                          <div className={styles.ratingCardHeader}>
                            <span className={styles.ratingCardName}>{t('heroDetail.appearanceRate')}</span>
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

                      {/* Ban Rate */}
                      {hero.main_hero_ban_rate && (
                        <div className={styles.ratingCard}>
                          <div className={styles.ratingCardHeader}>
                            <span className={styles.ratingCardName}>{t('heroDetail.banRate')}</span>
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

                      {/* Win Rate */}
                      {hero.main_hero_win_rate && (
                        <div className={styles.ratingCard}>
                          <div className={styles.ratingCardHeader}>
                            <span className={styles.ratingCardName}>{t('heroDetail.winRate')}</span>
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
                  </div>
                )}

                {/* Stats Table */}
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

                {/* Ability Ratings */}
                {hero.abilityshow && hero.abilityshow.length > 0 && (
                  <div className={styles.abilityShow}>
                    <h3 className={styles.abilityShowTitle}>{t('heroDetail.abilityRatings')}</h3>
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
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className={styles.contentSection}>
                {/* Full Description */}
                {(hero.full_description || hero.full_description_uk) && (() => {
                  const fullDescription = getHeroFullDescription(hero, i18n.language);
                  return (
                    <div className={styles.descriptionSection}>
                      <h3 className={styles.descriptionTitle}>{t('heroDetail.about', { name: getHeroName(hero, i18n.language) })}</h3>
                      <p className={`${styles.descriptionText} ${!showFullDescription ? styles.descriptionTextCollapsed : ''}`}>
                        {fullDescription}
                      </p>
                      {fullDescription.length > 300 && (
                        <button 
                          className={styles.showMoreButton}
                          onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                          {showFullDescription ? t('heroDetail.showLess') : t('heroDetail.showMore')}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Counter Tab */}
            {activeTab === 'counter' && (
              <div className={styles.contentSection}>
                {hero.counter_data && (() => {
                  const heroCounterData = parseMaybeJson<any>(hero.counter_data);
                  if (!heroCounterData) return null;
                  const bestCounters = heroCounterData.best_counters || heroCounterData.counters || [];
                  const mostCounteredBy = heroCounterData.most_countered_by || heroCounterData.allies || [];
                  return (
                  <div className={styles.relationshipSection}>
                    <h2 className={styles.relationshipMainTitle}>{t('heroDetail.counterRelationship')}</h2>
                    
                    {/* Counter Tabs */}
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
                      {/* Left Side - Visual Comparison */}
                      <div className={styles.comparisonBlock}>
                        {counterSubTab === 'best' && bestCounters.length > 0 && (() => {
                          const topCounter = bestCounters[0];
                          const counterHeroId = topCounter.heroid ?? topCounter.hero_id;
                          const counterHero = findHeroByGameId(counterHeroId);
                          if (!counterHero) return null;
                          
                          // Normalize win rates - if value < 1, it's decimal format (0.5), otherwise it's already percentage (50)
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
                                {t('heroDetail.counterComparisonDesc')}
                              </p>
                            </>
                          );
                        })()}
                        {counterSubTab === 'worst' && mostCounteredBy.length > 0 && (() => {
                          const topCounter = mostCounteredBy[0];
                          const counterHeroId = topCounter.heroid ?? topCounter.hero_id;
                          const counterHero = findHeroByGameId(counterHeroId);
                          if (!counterHero) return null;
                          
                          // Normalize win rates - if value < 1, it's decimal format (0.5), otherwise it's already percentage (50)
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
                                {t('heroDetail.strugglesAgainst', { hero: hero.name })}
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      {/* Right Side - Counter List */}
                      <div className={styles.counterList}>
                        <div className={styles.counterListHeader}>
                          <span>{counterSubTab === 'best' ? t('heroDetail.bestCounters') : t('heroDetail.counteredBy')}</span>
                          <span>{t('heroDetail.counterScore')}</span>
                        </div>
                        {counterSubTab === 'best' && bestCounters.slice(0, 5).map((counter: any, idx: number) => {
                          const counterHeroId = counter.heroid ?? counter.hero_id;
                          const counterHero = findHeroByGameId(counterHeroId);
                          if (!counterHero) return null;
                          const increaseWinRate = counter.increase_win_rate != null ? Math.abs(counter.increase_win_rate < 1 ? counter.increase_win_rate * 100 : counter.increase_win_rate) : 0;
                          return (
                            <a 
                              key={counterHeroId}
                              href={`/2/heroes/${counterHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.counterListImage} />
                              <span className={styles.counterListScore}>{increaseWinRate.toFixed(2)}</span>
                            </a>
                          );
                        })}
                        {counterSubTab === 'worst' && mostCounteredBy.slice(0, 5).map((counter: any, idx: number) => {
                          const counterHeroId = counter.heroid ?? counter.hero_id;
                          const counterHero = findHeroByGameId(counterHeroId);
                          if (!counterHero) return null;
                          const increaseWinRate = counter.increase_win_rate != null ? Math.abs(counter.increase_win_rate) : 0;
                          const normalizedRate = increaseWinRate !== 0 && increaseWinRate < 1 ? increaseWinRate * 100 : increaseWinRate;
                          return (
                            <a 
                              key={counterHeroId}
                              href={`/2/heroes/${counterHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.counterListImage} />
                              <span className={styles.counterListScore}>{normalizedRate.toFixed(2)}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
            )}

            {/* Synergy Tab (Best With) */}
            {activeTab === 'synergy' && (
              <div className={styles.contentSection}>
                {hero.compatibility_data && (() => {
                  const heroCompatibilityData = parseMaybeJson<any>(hero.compatibility_data);
                  if (!heroCompatibilityData) return null;
                  return (
                  <div className={styles.relationshipSection}>
                    <h2 className={styles.relationshipMainTitle}>{t('heroDetail.compatibility')}</h2>
                    
                    {/* Compatibility Tabs */}
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
                      {/* Left Side - Visual Comparison */}
                      <div className={styles.comparisonBlock}>
                        {synergySubTab === 'compatible' && heroCompatibilityData.compatible && heroCompatibilityData.compatible.length > 0 && (() => {
                          const topMate = heroCompatibilityData.compatible[0];
                          const topMateId = topMate.heroid ?? topMate.hero_id;
                          const mateHero = findHeroByGameId(topMateId);
                          if (!mateHero) return null;
                          
                          const heroWinRate = (heroCompatibilityData.main_hero_win_rate || 0.5) * 100;
                          const teamWinRate = topMate.win_rate * 100;
                          
                          return (
                            <>
                              <div className={styles.heroComparison}>
                                <div className={`${styles.heroComparisonSide} ${styles.left}`}>
                                  <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{heroWinRate.toFixed(2)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                                <div className={styles.heroComparisonDivider}></div>
                                <div className={`${styles.heroComparisonSide} ${styles.right}`}>
                                  <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.rightAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{teamWinRate.toFixed(2)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.comparisonDesc}>
                                {t('heroDetail.teammateScoreDesc')}
                              </p>
                            </>
                          );
                        })()}
                        {synergySubTab === 'incompatible' && heroCompatibilityData.not_compatible && heroCompatibilityData.not_compatible.length > 0 && (() => {
                          const topMate = heroCompatibilityData.not_compatible[0];
                          const topMateId = topMate.heroid ?? topMate.hero_id;
                          const mateHero = findHeroByGameId(topMateId);
                          if (!mateHero) return null;
                          
                          const heroWinRate = (heroCompatibilityData.main_hero_win_rate || 0.5) * 100;
                          const teamWinRate = topMate.win_rate * 100;
                          
                          return (
                            <>
                              <div className={styles.heroComparison}>
                                <div className={`${styles.heroComparisonSide} ${styles.left}`}>
                                  <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{heroWinRate.toFixed(2)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                                <div className={styles.heroComparisonDivider}></div>
                                <div className={`${styles.heroComparisonSide} ${styles.right}`}>
                                  <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.rightAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{teamWinRate.toFixed(2)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.comparisonDesc}>
                                {t('heroDetail.teammateScoreLowDesc')}
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      {/* Right Side - Teammate List */}
                      <div className={styles.counterList}>
                        <div className={styles.counterListHeader}>
                          <span>{synergySubTab === 'compatible' ? t('heroDetail.bestTeammates') : t('heroDetail.worstTeammates')}</span>
                          <span>{t('heroDetail.teammateScore')}</span>
                        </div>
                        {synergySubTab === 'compatible' && heroCompatibilityData.compatible && heroCompatibilityData.compatible.slice(0, 5).map((mate: any, idx: number) => {
                          const mateId = mate.heroid ?? mate.hero_id;
                          const mateHero = findHeroByGameId(mateId);
                          if (!mateHero) return null;
                          return (
                            <a 
                              key={mateId ?? mate.heroid}
                              href={`/2/heroes/${mateHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.counterListImage} />
                                <span className={styles.counterListScore}>{mate.increase_win_rate != null ? (mate.increase_win_rate * 100).toFixed(2) : '0.00'}</span>
                            </a>
                          );
                        })}
                        {synergySubTab === 'incompatible' && heroCompatibilityData.not_compatible && heroCompatibilityData.not_compatible.slice(0, 5).map((mate: any, idx: number) => {
                          const mateId = mate.heroid ?? mate.hero_id;
                          const mateHero = findHeroByGameId(mateId);
                          if (!mateHero) return null;
                          return (
                            <a 
                              key={mateId ?? mate.heroid}
                              href={`/2/heroes/${mateHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.counterListImage} />
                                <span className={styles.counterListScore}>{mate.increase_win_rate != null ? Math.abs(mate.increase_win_rate).toFixed(2) : '0.00'}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
            )}

            {/* History Tab - Patch History */}
            {activeTab === 'history' && (
              <div className={styles.contentSection}>
                <div className={styles.historySection}>
                  <div className={styles.historyHeader}>
                    <div>
                      <h2 className={styles.historySectionTitle}>{t('heroDetail.balanceHistory')}</h2>
                      <p className={styles.historySectionDesc}>
                        {t('heroDetail.balanceHistoryDesc', { hero: hero.name })}
                      </p>
                    </div>
                    <a href={`/${hero.game_id}/patches`} className={styles.viewAllPatchesBtn}>
                      {t('heroDetail.viewAllPatches')}
                    </a>
                  </div>

                  {heroPatches.length > 0 ? (
                    <div className={styles.patchesTimeline}>
                      {heroPatches.map((patch: Patch) => {
                        // Support both old and new formats
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
                                  day: 'numeric'
                                })}
                              </div>
                            </div>

                            {/* Summary/Description from any format */}
                            {(heroChange?.summary || (heroAdjustment as any)?.summary || heroAdjustment?.description) && (
                              <div className={styles.patchSummary}>
                                {heroChange?.summary && <p>{heroChange.summary}</p>}
                                {!heroChange?.summary && (heroAdjustment as any)?.summary && <p>{(heroAdjustment as any).summary}</p>}
                                {!heroChange?.summary && !(heroAdjustment as any)?.summary && heroAdjustment?.description && (
                                  <div dangerouslySetInnerHTML={{ __html: heroAdjustment.description }} />
                                )}
                              </div>
                            )}

                            {/* Skills from any format */}
                            {(heroChange?.skills || (heroAdjustment as any)?.skills) && (heroChange?.skills || (heroAdjustment as any)?.skills).length > 0 && (
                              <div className={styles.skillChanges}>
                                {(heroChange?.skills || (heroAdjustment as any)?.skills).map((skill: any, idx: number) => (
                                  <div key={idx} className={styles.skillChange}>
                                    <div className={styles.skillHeader}>
                                      <div className={styles.skillName}>
                                        <span className={styles.skillType}>{skill.type}</span>
                                        {skill.name && (
                                          <span className={styles.skillNameText}>{skill.name}</span>
                                        )}
                                      </div>
                                      {skill.balance && (
                                        <span 
                                          className={styles.balanceBadge} 
                                          data-balance={skill.balance.toLowerCase()}
                                        >
                                          {skill.balance}
                                        </span>
                                      )}
                                    </div>
                                    {skill.changes && skill.changes.length > 0 && (
                                      <ul className={styles.changesList}>
                                        {skill.changes.map((change: string, changeIdx: number) => (
                                          <li key={changeIdx} className={styles.changeItem}>
                                            {change}
                                          </li>
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
                                        <span 
                                          className={styles.balanceBadge} 
                                          data-balance={adj.badge.toLowerCase()}
                                        >
                                          {adj.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className={styles.changesList}>
                                      <div className={styles.changeItem} dangerouslySetInnerHTML={{ __html: adj.description }} />
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
                                        <span 
                                          className={styles.balanceBadge} 
                                          data-balance={adj.badge.toLowerCase()}
                                        >
                                          {adj.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className={styles.changesList}>
                                      <div className={styles.changeItem} dangerouslySetInnerHTML={{ __html: adj.description }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className={styles.patchLink}>
                              <a href={`/${hero.game_id}/patches/patch_${patch.version}#${hero.name}`}>
                                {t('heroDetail.viewFullPatchNotes')}
                              </a>
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
            )}

            {/* Builds Tab */}
            {activeTab === 'builds' && (
              <div className={styles.contentSection}>
                {/* Sub-tabs: Builds / My Builds */}
                <div className={styles.relationshipTabs}>
                  <button
                    className={`${styles.relationshipTab} ${buildsSubTab === 'builds' ? styles.relationshipTabActive : ''}`}
                    onClick={() => setBuildsSubTab('builds')}
                  >
                    {t('heroDetail.proBuilds')}
                  </button>
                  {user && (
                    <button
                      className={`${styles.relationshipTab} ${buildsSubTab === 'my' ? styles.relationshipTabActive : ''}`}
                      onClick={() => setBuildsSubTab('my')}
                    >
                      {t('builds.myBuilds')}
                    </button>
                  )}
                </div>

                {buildsSubTab === 'builds' && (
                  <>
                    <ProBuildsSection 
                      builds={hero.pro_builds || []} 
                      gameId={hero.game_id} 
                    />
                    <CommunityBuildsSection
                      heroId={hero.id}
                      gameId={hero.game_id}
                      showOnly="community"
                    />
                  </>
                )}

                {buildsSubTab === 'my' && user && (
                  <CommunityBuildsSection
                    heroId={hero.id}
                    gameId={hero.game_id}
                    showOnly="my"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section - Below Hero Header */}
      <SkillsSection
        displaySkills={displaySkills}
        selectedSkillIndex={selectedSkillIndex}
        selectedSkill={selectedSkill}
        maxTransforms={maxTransforms}
        transformIndex={transformIndex}
        changedIndices={changedIndices}
        onSkillSelect={handleSkillSelect}
        onTransformCycle={cycleTransform}
      />
    </div>
  );
}

export default HeroDetailPage;
