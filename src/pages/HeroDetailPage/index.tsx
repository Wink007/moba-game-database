import { useParams } from 'react-router-dom';
import React from 'react';
import { useHero, useHeroSkillsById, useHeroCounterData, useHeroCompatibilityData, useHeroes, usePatches } from '../../hooks/useHeroes';
import { Loader } from '../../components/Loader';
import styles from './styles.module.scss';
import type { Patch } from '../../types';

function HeroDetailPage() {
  const { heroId } = useParams();
  const { data: hero, isLoading: heroLoading, isError: heroError } = useHero(Number(heroId));
  console.log('hero: ', hero);
  const { data: skills = [], isLoading: skillsLoading } = useHeroSkillsById(Number(heroId));
  const { data: allHeroes = [] } = useHeroes(hero?.game_id);
  // const { data: relations } = useHeroRelations(hero?.game_id);
  const { data: counterData } = useHeroCounterData(hero?.game_id);
  const { data: compatibilityData } = useHeroCompatibilityData(hero?.game_id);
  const { data: patches = [] } = usePatches();
  
  // Фільтруємо патчі, що містять зміни для цього героя
  const heroPatches = React.useMemo(() => {
    if (!hero || !patches) return [];
    return patches.filter((patch: Patch) => 
      (patch.hero_changes && patch.hero_changes[hero.name]) ||
      (patch.hero_adjustments && patch.hero_adjustments[hero.name])
    );
  }, [patches, hero]);
  
  console.log('heroPatches:', heroPatches);
  
  const [selectedSkillIndex, setSelectedSkillIndex] = React.useState<number>(0);
  const [activeTab, setActiveTab] = React.useState<'info' | 'about' | 'counter' | 'synergy' | 'history'>('info');
  const [counterSubTab, setCounterSubTab] = React.useState<'best' | 'worst'>('best');
  const [synergySubTab, setSynergySubTab] = React.useState<'compatible' | 'incompatible'>('compatible');
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const [transformIndex, setTransformIndex] = React.useState(0);

  // Ability labels
  const abilitiesLabel = ['Durability', 'Offense', 'Ability Effects', 'Difficulty'];

  // Helper function to get rating level
  const getRatingLevel = (rate: number): { level: string; color: string } => {
    if (rate >= 60) return { level: 'Very High', color: 'high' };
    if (rate >= 40) return { level: 'High', color: 'medium-high' };
    if (rate >= 20) return { level: 'Average', color: 'medium' };
    return { level: 'Low', color: 'low' };
  };

  // Фільтруємо навички які не є трансформаціями та сортуємо за display_order
  const baseSkills = skills
    .filter(skill => !skill.is_transformed)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const transformedSkills = skills
    .filter(skill => skill.is_transformed)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const maxTransforms = transformedSkills.length > 0 
    ? Math.max(...transformedSkills.map(s => s.transformation_order || 0))
    : 0;

  const displaySkills = transformIndex === 0
    ? baseSkills
    : baseSkills.map(base => 
        transformedSkills.find(
          t => t.replaces_skill_id === base.id && t.transformation_order === transformIndex
        ) || base
      );

  const cycleTransform = () => {
    setTransformIndex((prev) => (prev + 1) % (maxTransforms + 1));
  };

  // Вибираємо навичку за індексом
  const selectedSkill = displaySkills[selectedSkillIndex] || displaySkills[0];

  React.useEffect(() => {
    // Якщо обраний індекс більше ніж є скілів, скидаємо на 0
    if (selectedSkillIndex >= displaySkills.length && displaySkills.length > 0) {
      setSelectedSkillIndex(0);
    }
  }, [displaySkills, selectedSkillIndex]);

  if (heroLoading || skillsLoading) return <Loader />;
  if (heroError || !hero) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Hero not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <div className={styles.heroSidebar}>
          {/* Hero Name in Sidebar */}
          <div className={styles.sidebarHeroName}>
            <h2>{hero.name}</h2>
            {hero.roles && hero.roles.length > 0 && (
              <p className={styles.sidebarHeroRole}>{hero.roles.join(' • ')}</p>
            )}
          </div>

          {hero.image && (
            <div className={styles.heroPortrait}>
              <img src={hero.image} alt={hero.name} />
            </div>
          )}

          {/* HP and Mana Bars */}
          <div className={styles.heroVitals}>
            {hero.hero_stats && (
              <div className={styles.vitalBar}>
                <div className={styles.vitalValue}>
                  {hero.hero_stats?.hp} HP
                </div>
                <div className={styles.vitalGrowth}>+{hero.hero_stats?.hp_regen || '0'}</div>
              </div>
            )}
            {!!hero.hero_stats?.mana && (
              <div className={styles.vitalBar} data-type="mana">
                <div className={styles.vitalValue}>
                  {hero.hero_stats?.mana} MP
                </div>
                <div className={styles.vitalGrowth}>+{hero.hero_stats?.mana_regen || '0'}</div>
              </div>
            )}
          </div>

          {/* Short Description */}
          {hero.short_description && (
            <div className={styles.sidebarDescription}>
              <p>{hero.short_description}</p>
            </div>
          )}

          {/* Specialty Tags */}
          {hero.specialty && hero.specialty.length > 0 && (
            <div className={styles.sidebarSpecialty}>
              <div className={styles.specialtyTags}>
                {hero.specialty.map((spec, idx) => (
                  <span key={idx} className={styles.specialtyTag}>{spec}</span>
                ))}
              </div>
            </div>
          )}

          {/* Damage Type */}
          {hero.damage_type && (
            <div className={styles.sidebarInfo}>
              <span className={styles.sidebarInfoLabel}>Damage Type:</span>
              <span className={styles.sidebarInfoValue}>{hero.damage_type}</span>
            </div>
          )}

          {/* Lane */}
          {hero.lane && hero.lane.length > 0 && (
            <div className={styles.sidebarInfo}>
              <span className={styles.sidebarInfoLabel}>Lane:</span>
              <span className={styles.sidebarInfoValue}>{hero.lane.join(', ')}</span>
            </div>
          )}
        </div>

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

          {/* Tabs Navigation */}
          <div className={styles.tabsNavigation}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Base Information
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'about' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'counter' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('counter')}
            >
              Counters
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'synergy' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('synergy')}
            >
              Best With
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Stats History
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Base Information Tab */}
            {activeTab === 'info' && (
              <div className={styles.contentSection}>
                {/* Performance Ratings */}
                {(hero.main_hero_appearance_rate || hero.main_hero_ban_rate || hero.main_hero_win_rate) && (
                  <div className={styles.performanceRatings}>
                    <h3 className={styles.sectionTitle}>Performance Stats</h3>
                    <div className={styles.ratingsGrid}>
                      {/* Appearance Rate */}
                      {hero.main_hero_appearance_rate && (
                        <div className={styles.ratingCard}>
                          <div className={styles.ratingCardHeader}>
                            <span className={styles.ratingCardName}>Appearance Rate</span>
                            <span className={styles.ratingCardValue}>{hero.main_hero_appearance_rate.toFixed(1)}%</span>
                          </div>
                          <div className={styles.ratingBar}>
                            <div 
                              className={styles.ratingBarFill}
                              style={{ width: `${Math.min(hero.main_hero_appearance_rate, 100)}%` }}
                              data-level={getRatingLevel(hero.main_hero_appearance_rate).color}
                            />
                          </div>
                          <span className={styles.ratingCardDescription}>Pick frequency in matches</span>
                        </div>
                      )}

                      {/* Ban Rate */}
                      {hero.main_hero_ban_rate && (
                        <div className={styles.ratingCard}>
                          <div className={styles.ratingCardHeader}>
                            <span className={styles.ratingCardName}>Ban Rate</span>
                            <span className={styles.ratingCardValue}>{hero.main_hero_ban_rate.toFixed(1)}%</span>
                          </div>
                          <div className={styles.ratingBar}>
                            <div 
                              className={styles.ratingBarFill}
                              style={{ width: `${Math.min(hero.main_hero_ban_rate, 100)}%` }}
                              data-level={getRatingLevel(hero.main_hero_ban_rate).color}
                            />
                          </div>
                          <span className={styles.ratingCardDescription}>How often banned</span>
                        </div>
                      )}

                      {/* Win Rate */}
                      {hero.main_hero_win_rate && (
                        <div className={styles.ratingCard}>
                          <div className={styles.ratingCardHeader}>
                            <span className={styles.ratingCardName}>Win Rate</span>
                            <span className={styles.ratingCardValue}>{hero.main_hero_win_rate.toFixed(1)}%</span>
                          </div>
                          <div className={styles.ratingBar}>
                            <div 
                              className={styles.ratingBarFill}
                              style={{ width: `${Math.min(hero.main_hero_win_rate, 100)}%` }}
                              data-level={getRatingLevel(hero.main_hero_win_rate).color}
                            />
                          </div>
                          <span className={styles.ratingCardDescription}>Games won percentage</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Table */}
                <div className={styles.statsTable}>
                  <div className={styles.statsTableRow}>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Physical Attack</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.physical_attack || '0'}</span>
                    </div>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Physical Defense</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.physical_defense || '0'}</span>
                    </div>
                  </div>
                  <div className={styles.statsTableRow}>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Magic Power</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.magic_power ?? '0'}</span>
                    </div>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Magic Defense</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.magic_defense || '0'}</span>
                    </div>
                  </div>
                  <div className={styles.statsTableRow}>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Attack Speed</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.attack_speed || '0'}</span>
                    </div>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Movement Speed</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.movement_speed || '0'}</span>
                    </div>
                  </div>
                  {hero.hero_stats?.attack_speed_ratio && (
                    <div className={styles.statsTableRow}>
                      <div className={`${styles.statsTableCell} ${styles.fullWidthCell}`}>
                        <span className={styles.statName}>Attack Speed Ratio</span>
                        <span className={styles.statValueLarge}>{hero.hero_stats.attack_speed_ratio}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ability Ratings */}
                {hero.abilityshow && hero.abilityshow.length > 0 && (
                  <div className={styles.abilityShow}>
                    <h3 className={styles.abilityShowTitle}>Ability Ratings</h3>
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
                {hero.full_description && (
                  <div className={styles.descriptionSection}>
                    <h3 className={styles.descriptionTitle}>About {hero.name}</h3>
                    <p className={`${styles.descriptionText} ${!showFullDescription ? styles.descriptionTextCollapsed : ''}`}>
                      {hero.full_description}
                    </p>
                    {hero.full_description.length > 300 && (
                      <button 
                        className={styles.showMoreButton}
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Counter Tab */}
            {activeTab === 'counter' && (
              <div className={styles.contentSection}>
                {counterData && hero.hero_game_id && counterData[hero.hero_game_id] && (() => {
                  const heroCounterData = counterData[hero.hero_game_id];
                  return (
                  <div className={styles.relationshipSection}>
                    <h2 className={styles.relationshipMainTitle}>Counter Relationship</h2>
                    
                    {/* Counter Tabs */}
                    <div className={styles.relationshipTabs}>
                      <button 
                        className={`${styles.relationshipTab} ${counterSubTab === 'best' ? styles.relationshipTabActive : ''}`}
                        onClick={() => setCounterSubTab('best')}
                      >
                        Best Counters
                      </button>
                      <button 
                        className={`${styles.relationshipTab} ${counterSubTab === 'worst' ? styles.relationshipTabActive : ''}`}
                        onClick={() => setCounterSubTab('worst')}
                      >
                        Most Countered by
                      </button>
                    </div>

                    <div className={styles.relationshipContent}>
                      {/* Left Side - Visual Comparison */}
                      <div className={styles.comparisonBlock}>
                        {counterSubTab === 'best' && heroCounterData.best_counters && heroCounterData.best_counters.length > 0 && (() => {
                          const topCounter = heroCounterData.best_counters[0];
                          const counterHero = allHeroes.find(h => h.hero_game_id === topCounter.heroid);
                          if (!counterHero) return null;
                          
                          const heroWinRate = heroCounterData.main_hero_win_rate || 50;
                          const counterWinRate = topCounter.win_rate;
                          
                          return (
                            <>
                              <div className={styles.heroComparison}>
                                <div className={`${styles.heroComparisonSide} ${styles.left}`}>
                                  <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{heroWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                                <div className={styles.heroComparisonDivider}></div>
                                <div className={`${styles.heroComparisonSide} ${styles.right}`}>
                                  <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.rightAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{counterWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.comparisonDesc}>
                                The following displays the hero's overall win rate. The higher the Counter Score, the more the selected hero is countered.
                              </p>
                            </>
                          );
                        })()}
                        {counterSubTab === 'worst' && heroCounterData.most_countered_by && heroCounterData.most_countered_by.length > 0 && (() => {
                          const topCounter = heroCounterData.most_countered_by[0];
                          const counterHero = allHeroes.find(h => h.hero_game_id === topCounter.heroid);
                          if (!counterHero) return null;
                          
                          const heroWinRate = heroCounterData.main_hero_win_rate || 50;
                          const counterWinRate = topCounter.win_rate;
                          
                          return (
                            <>
                              <div className={styles.heroComparison}>
                                <div className={`${styles.heroComparisonSide} ${styles.left}`}>
                                  <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{heroWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                                <div className={styles.heroComparisonDivider}></div>
                                <div className={`${styles.heroComparisonSide} ${styles.right}`}>
                                  <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.rightAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{counterWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.comparisonDesc}>
                                Heroes that {hero.name} struggles against. Lower win rate indicates stronger counter effect.
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      {/* Right Side - Counter List */}
                      <div className={styles.counterList}>
                        <div className={styles.counterListHeader}>
                          <span>{counterSubTab === 'best' ? 'Best Counters' : 'Countered By'}</span>
                          <span>Counter Score</span>
                        </div>
                        {counterSubTab === 'best' && heroCounterData.best_counters && heroCounterData.best_counters.slice(0, 5).map((counter, idx) => {
                          const counterHero = allHeroes.find(h => h.hero_game_id === counter.heroid);
                          if (!counterHero) return null;
                          return (
                            <a 
                              key={counter.heroid}
                              href={`/2/heroes/${counterHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.counterListImage} />
                              <span className={styles.counterListScore}>{counter.increase_win_rate.toFixed(2)}</span>
                            </a>
                          );
                        })}
                        {counterSubTab === 'worst' && heroCounterData.most_countered_by && heroCounterData.most_countered_by.slice(0, 5).map((counter, idx) => {
                          const counterHero = allHeroes.find(h => h.hero_game_id === counter.heroid);
                          if (!counterHero) return null;
                          return (
                            <a 
                              key={counter.heroid}
                              href={`/2/heroes/${counterHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={counterHero.head || counterHero.image} alt={counterHero.name} className={styles.counterListImage} />
                              <span className={styles.counterListScore}>{Math.abs(counter.increase_win_rate).toFixed(2)}</span>
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
                {compatibilityData && hero.hero_game_id && compatibilityData[hero.hero_game_id] && (() => {
                  const heroCompatibilityData = compatibilityData[hero.hero_game_id];
                  return (
                  <div className={styles.relationshipSection}>
                    <h2 className={styles.relationshipMainTitle}>Compatibility</h2>
                    
                    {/* Compatibility Tabs */}
                    <div className={styles.relationshipTabs}>
                      <button 
                        className={`${styles.relationshipTab} ${synergySubTab === 'compatible' ? styles.relationshipTabActive : ''}`}
                        onClick={() => setSynergySubTab('compatible')}
                      >
                        Compatibility
                      </button>
                      <button 
                        className={`${styles.relationshipTab} ${synergySubTab === 'incompatible' ? styles.relationshipTabActive : ''}`}
                        onClick={() => setSynergySubTab('incompatible')}
                      >
                        Not Compatible
                      </button>
                    </div>

                    <div className={styles.relationshipContent}>
                      {/* Left Side - Visual Comparison */}
                      <div className={styles.comparisonBlock}>
                        {synergySubTab === 'compatible' && heroCompatibilityData.compatible && heroCompatibilityData.compatible.length > 0 && (() => {
                          const topMate = heroCompatibilityData.compatible[0];
                          const mateHero = allHeroes.find(h => h.hero_game_id === topMate.heroid);
                          if (!mateHero) return null;
                          
                          const heroWinRate = heroCompatibilityData.main_hero_win_rate || 50;
                          const teamWinRate = topMate.win_rate;
                          
                          return (
                            <>
                              <div className={styles.heroComparison}>
                                <div className={`${styles.heroComparisonSide} ${styles.left}`}>
                                  <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{heroWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                                <div className={styles.heroComparisonDivider}></div>
                                <div className={`${styles.heroComparisonSide} ${styles.right}`}>
                                  <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.rightAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{teamWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.comparisonDesc}>
                                The higher the Teammate Score, the better they fit on the same team.
                              </p>
                            </>
                          );
                        })()}
                        {synergySubTab === 'incompatible' && heroCompatibilityData.not_compatible && heroCompatibilityData.not_compatible.length > 0 && (() => {
                          const topMate = heroCompatibilityData.not_compatible[0];
                          const mateHero = allHeroes.find(h => h.hero_game_id === topMate.heroid);
                          if (!mateHero) return null;
                          
                          const heroWinRate = heroCompatibilityData.main_hero_win_rate || 50;
                          const teamWinRate = topMate.win_rate;
                          
                          return (
                            <>
                              <div className={styles.heroComparison}>
                                <div className={`${styles.heroComparisonSide} ${styles.left}`}>
                                  <img src={hero.head || hero.image} alt={hero.name} className={styles.leftAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{heroWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                                <div className={styles.heroComparisonDivider}></div>
                                <div className={`${styles.heroComparisonSide} ${styles.right}`}>
                                  <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.rightAvatar} />
                                  <div className={styles.comparisonWinRate}>
                                    <span className={styles.winRateNumber}>{teamWinRate.toFixed(1)}%</span>
                                    <span className={styles.winRateLabel}>Win Rate</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.comparisonDesc}>
                                The lower the Teammate Score, the worse they fit on the same team.
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      {/* Right Side - Teammate List */}
                      <div className={styles.counterList}>
                        <div className={styles.counterListHeader}>
                          <span>{synergySubTab === 'compatible' ? 'Best Teammates' : 'Worst Teammates'}</span>
                          <span>Teammate Score</span>
                        </div>
                        {synergySubTab === 'compatible' && heroCompatibilityData.compatible && heroCompatibilityData.compatible.slice(0, 5).map((mate, idx) => {
                          const mateHero = allHeroes.find(h => h.hero_game_id === mate.heroid);
                          if (!mateHero) return null;
                          return (
                            <a 
                              key={mate.heroid}
                              href={`/2/heroes/${mateHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.counterListImage} />
                              <span className={styles.counterListScore}>{mate.increase_win_rate.toFixed(2)}</span>
                            </a>
                          );
                        })}
                        {synergySubTab === 'incompatible' && heroCompatibilityData.not_compatible && heroCompatibilityData.not_compatible.slice(0, 5).map((mate, idx) => {
                          const mateHero = allHeroes.find(h => h.hero_game_id === mate.heroid);
                          if (!mateHero) return null;
                          return (
                            <a 
                              key={mate.heroid}
                              href={`/2/heroes/${mateHero.id}`}
                              className={styles.counterListItem}
                            >
                              <div className={styles.counterListRank}>{idx + 1}</div>
                              <img src={mateHero.head || mateHero.image} alt={mateHero.name} className={styles.counterListImage} />
                              <span className={styles.counterListScore}>{Math.abs(mate.increase_win_rate).toFixed(2)}</span>
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
                      <h2 className={styles.historySectionTitle}>Balance History</h2>
                      <p className={styles.historySectionDesc}>
                        Track all balance changes and adjustments for {hero.name} across game patches
                      </p>
                    </div>
                    <a href={`/${hero.game_id}/patches`} className={styles.viewAllPatchesBtn}>
                      View All Patches
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
                                <span className={styles.patchVersionLabel}>Version</span>
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
                                View in Full Patch Notes →
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noHistoryData}>
                      <p>No balance history available for this hero</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section - Below Hero Header */}
      {baseSkills.length > 0 && (
        <div className={styles.skillsSection}>
          <h2 className={styles.sectionTitle}>Abilities</h2>
          
          <div className={styles.skillsContainer}>
            {/* Skill Tabs */}
            <div className={styles.skillTabs}>
              {displaySkills.map((skill, index) => (
                <div 
                  key={skill.id} 
                  className={`${styles.skillTab} ${selectedSkillIndex === index ? styles.skillTabActive : ''}`}
                  onClick={() => setSelectedSkillIndex(index)}
                >
                  {skill.image && (
                    <img src={skill.image} alt={skill.skill_name} />
                  )}
                  {skill.skill_type && (
                    <div className={`${styles.skillTabBadge} ${styles[skill.skill_type]}`}>
                      {skill.skill_type === 'passive' ? 'P' : 'A'}
                    </div>
                  )}
                </div>
              ))}
              {maxTransforms > 0 && (
                <button
                  onClick={cycleTransform}
                  className={styles.transformButton}
                  title={transformIndex === 0 ? "Show transformation" : `Transformation ${transformIndex}`}
                >
                  🔄
                </button>
              )}
            </div>

          {/* Selected Skill Detail */}
            {selectedSkill && (
              <div className={styles.skillDetail}>
                <div className={styles.skillDetailHeader}>
                  <div className={styles.skillDetailInfo}>
                    <h3 className={styles.skillDetailName}>{selectedSkill.skill_name}</h3>
                    
                    {/* Effect Types badges under title */}
                    <div className={styles.skillBadges}>
                      {selectedSkill.effect_types && selectedSkill.effect_types.length > 0 && (
                        selectedSkill.effect_types.map((effectType, idx) => {
                          const displayType = typeof effectType === 'string' 
                            ? effectType 
                            : ((effectType as any)?.name || JSON.stringify(effectType));
                          return (
                            <div key={idx} className={styles.effectTypeBadge}>
                              {displayType}
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {/* Skill Parameters (CD, Mana Cost, etc.) */}
                    {selectedSkill.skill_parameters && Object.entries(selectedSkill.skill_parameters).length > 0 && <div className={styles.skillStatsInline}>
                      {/* Additional skill parameters */}
                      {selectedSkill.skill_parameters && typeof selectedSkill.skill_parameters === 'object' && 
                       Object.entries(selectedSkill.skill_parameters).map(([key, value]) => {
                        if (typeof value === 'object' && value !== null && 'name' in value) {
                          return null; // Skip objects with name (they go in level scaling)
                        }
                        
                        let displayValue: string;
                        if (typeof value === 'object' && value !== null && 'levels' in value && Array.isArray((value as any).levels)) {
                          displayValue = (value as any).levels.join(' / ');
                        } else {
                          displayValue = String(value);
                        }
                        
                        return (
                          <span key={key} className={styles.skillStatInline}>
                            {key}: {displayValue}
                          </span>
                        );
                      })}
                    </div>}

                    {selectedSkill.skill_description && (
                      <div 
                        className={styles.skillDetailDescription}
                        dangerouslySetInnerHTML={{ __html: selectedSkill.skill_description }}
                      />
                    )}
                  </div>
                </div>
                {/* Level Scaling */}
                {selectedSkill.level_scaling && (() => {
                  // Parse level_scaling if it's a string or use directly if it's an array
                  let scalingData: Array<{ levels: any[]; name: string }> = [];
                  
                  if (typeof selectedSkill.level_scaling === 'string') {
                    try {
                      scalingData = JSON.parse(selectedSkill.level_scaling);
                    } catch {
                      return null;
                    }
                  } else if (Array.isArray(selectedSkill.level_scaling)) {
                    scalingData = selectedSkill.level_scaling;
                  } else {
                    return null;
                  }

                  if (!scalingData.length || !scalingData[0]?.levels || scalingData[0].levels.length === 0) {
                    return null;
                  }

                  // Знаходимо максимальний рівень з фактичними даними
                  let actualMaxLevel = 0;
                  scalingData.forEach(param => {
                    if (param.levels && Array.isArray(param.levels)) {
                      for (let i = param.levels.length - 1; i >= 0; i--) {
                        if (param.levels[i] !== undefined && param.levels[i] !== null && param.levels[i] !== '') {
                          actualMaxLevel = Math.max(actualMaxLevel, i + 1);
                          break;
                        }
                      }
                    }
                  });

                  if (actualMaxLevel === 0) {
                    return null;
                  }

                  return (
                    <div className={styles.levelScaling}>
                      <div className={styles.levelScalingTable}>
                        <table>
                          <thead>
                            <tr>
                              <th></th>
                              {Array.from({ length: actualMaxLevel }, (_, i) => (
                                <th key={i}>Lv.{i + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {scalingData.map((param, idx) => (
                              <tr key={idx}>
                                <td className={styles.paramName}>{param.name}</td>
                                {Array.from({ length: actualMaxLevel }, (_, levelIdx) => (
                                  <td key={levelIdx}>
                                    {param.levels && param.levels[levelIdx] !== undefined && param.levels[levelIdx] !== null && param.levels[levelIdx] !== ''
                                      ? param.levels[levelIdx] 
                                      : '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Ability Details - hidden as usually empty */}
              </div>
            )}
          </div>
        </div>
        )}
    </div>
  );
}

export default HeroDetailPage;
