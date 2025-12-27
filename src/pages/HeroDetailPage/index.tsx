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
      patch.hero_changes && patch.hero_changes[hero.name]
    );
  }, [patches, hero]);
  
  console.log('heroPatches:', heroPatches);
  
  const [selectedSkillId, setSelectedSkillId] = React.useState<number | null>(null);
  const [activeTab, setActiveTab] = React.useState<'info' | 'about' | 'counter' | 'synergy' | 'history'>('info');
  const [counterSubTab, setCounterSubTab] = React.useState<'best' | 'worst'>('best');
  const [synergySubTab, setSynergySubTab] = React.useState<'compatible' | 'incompatible'>('compatible');

  // Ability labels
  const abilitiesLabel = ['Durability', 'Offense', 'Ability Effects', 'Difficulty'];

  // Helper function to get rating level
  const getRatingLevel = (rate: number): { level: string; color: string } => {
    if (rate >= 60) return { level: 'Very High', color: 'high' };
    if (rate >= 40) return { level: 'High', color: 'medium-high' };
    if (rate >= 20) return { level: 'Average', color: 'medium' };
    return { level: 'Low', color: 'low' };
  };

  // Фільтруємо навички які не є трансформаціями
  const mainSkills = skills.filter(skill => !skill.is_transformed);
  const transformedSkills = skills.filter(skill => skill.is_transformed);

  // Вибираємо першу навичку за замовчуванням
  const selectedSkill = selectedSkillId 
    ? skills.find(s => s.id === selectedSkillId) 
    : mainSkills[0];

  React.useEffect(() => {
    if (mainSkills.length > 0 && !selectedSkillId) {
      setSelectedSkillId(mainSkills[0].id);
    }
  }, [mainSkills, selectedSkillId]);

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

          {/* Performance Ratings */}
          {(hero.main_hero_appearance_rate || hero.main_hero_ban_rate || hero.main_hero_win_rate) && (
            <div className={styles.ratingsContainer}>
              <div className={styles.ratingsTable}>
                {/* Appearance Rate */}
                {hero.main_hero_appearance_rate && (
                  <div className={styles.ratingRow}>
                    <div className={styles.ratingInfo}>
                      <span className={styles.ratingName}>Appearance Rate</span>
                      <span className={styles.ratingDescription}>Pick frequency in matches</span>
                    </div>
                    <div className={styles.ratingData}>
                      <span className={styles.ratingPercentage}>{hero.main_hero_appearance_rate.toFixed(1)}%</span>
                      <div className={styles.ratingBar}>
                        <div 
                          className={styles.ratingBarFill}
                          style={{ width: `${Math.min(hero.main_hero_appearance_rate, 100)}%` }}
                          data-level={getRatingLevel(hero.main_hero_appearance_rate).color}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ban Rate */}
                {hero.main_hero_ban_rate && (
                  <div className={styles.ratingRow}>
                    <div className={styles.ratingInfo}>
                      <span className={styles.ratingName}>Ban Rate</span>
                      <span className={styles.ratingDescription}>How often banned</span>
                    </div>
                    <div className={styles.ratingData}>
                      <span className={styles.ratingPercentage}>{hero.main_hero_ban_rate.toFixed(1)}%</span>
                      <div className={styles.ratingBar}>
                        <div 
                          className={styles.ratingBarFill}
                          style={{ width: `${Math.min(hero.main_hero_ban_rate, 100)}%` }}
                          data-level={getRatingLevel(hero.main_hero_ban_rate).color}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Win Rate */}
                {hero.main_hero_win_rate && (
                  <div className={styles.ratingRow}>
                    <div className={styles.ratingInfo}>
                      <span className={styles.ratingName}>Win Rate</span>
                      <span className={styles.ratingDescription}>Games won percentage</span>
                    </div>
                    <div className={styles.ratingData}>
                      <span className={styles.ratingPercentage}>{hero.main_hero_win_rate.toFixed(1)}%</span>
                      <div className={styles.ratingBar}>
                        <div 
                          className={styles.ratingBarFill}
                          style={{ width: `${Math.min(hero.main_hero_win_rate, 100)}%` }}
                          data-level={getRatingLevel(hero.main_hero_win_rate).color}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Short Description */}
          {hero.short_description && (
            <div className={styles.sidebarDescription}>
              <p>{hero.short_description}</p>
            </div>
          )}

          {/* Specialty Tags */}
          {hero.specialty && hero.specialty.length > 0 && (
            <div className={styles.sidebarSpecialty}>
              <div className={styles.sidebarSpecialtyLabel}>Specialty:</div>
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
                      <div className={styles.statsTableCell}>
                        <span className={styles.statName}>Attack Speed Ratio</span>
                        <span className={styles.statValueLarge}>{hero.hero_stats.attack_speed_ratio}</span>
                      </div>
                      <div className={styles.statsTableCell}>
                        {/* Порожня клітинка */}
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
                    <p className={styles.descriptionText}>{hero.full_description}</p>
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
                              href={`/heroes/${counterHero.id}`}
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
                              href={`/heroes/${counterHero.id}`}
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
                              href={`/heroes/${mateHero.id}`}
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
                              href={`/heroes/${mateHero.id}`}
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
                        const heroChange = patch.hero_changes![hero.name];
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

                            {heroChange.summary && (
                              <div className={styles.patchSummary}>
                                <p>{heroChange.summary}</p>
                              </div>
                            )}

                            {heroChange.skills && heroChange.skills.length > 0 && (
                              <div className={styles.skillChanges}>
                                {heroChange.skills.map((skill, idx) => (
                                  <div key={idx} className={styles.skillChange}>
                                    <div className={styles.skillHeader}>
                                      <div className={styles.skillName}>
                                        <span className={styles.skillType}>{skill.type}</span>
                                        {skill.name && (
                                          <span className={styles.skillNameText}>{skill.name}</span>
                                        )}
                                      </div>
                                      <span 
                                        className={styles.balanceBadge} 
                                        data-balance={skill.balance.toLowerCase()}
                                      >
                                        {skill.balance}
                                      </span>
                                    </div>
                                    {skill.changes && skill.changes.length > 0 && (
                                      <ul className={styles.changesList}>
                                        {skill.changes.map((change, changeIdx) => (
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
      {mainSkills.length > 0 && (
        <div className={styles.skillsSection}>
          <h2 className={styles.sectionTitle}>Abilities</h2>
          
          {/* Skill Tabs */}
          <div className={styles.skillTabs}>
            {mainSkills.map((skill) => (
              <div 
                key={skill.id} 
                className={`${styles.skillTab} ${selectedSkillId === skill.id ? styles.skillTabActive : ''}`}
                onClick={() => setSelectedSkillId(skill.id)}
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
            {transformedSkills.map((skill) => (
              <div 
                key={skill.id} 
                className={`${styles.skillTab} ${styles.skillTabTransformed} ${selectedSkillId === skill.id ? styles.skillTabActive : ''}`}
                onClick={() => setSelectedSkillId(skill.id)}
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
                    <div className={styles.skillStatsInline}>
                      {selectedSkill.cooldown && (
                        <span className={styles.skillStatInline}>
                          CD: {typeof selectedSkill.cooldown === 'object' ? JSON.stringify(selectedSkill.cooldown) : selectedSkill.cooldown}
                        </span>
                      )}
                      {selectedSkill.mana_cost && (
                        <span className={styles.skillStatInline}>
                          Mana Cost: {typeof selectedSkill.mana_cost === 'object' ? JSON.stringify(selectedSkill.mana_cost) : selectedSkill.mana_cost}
                        </span>
                      )}
                      {selectedSkill.cast_range && (
                        <span className={styles.skillStatInline}>
                          Cast Range: {typeof selectedSkill.cast_range === 'object' ? JSON.stringify(selectedSkill.cast_range) : selectedSkill.cast_range}
                        </span>
                      )}
                      {selectedSkill.damage && (
                        <span className={styles.skillStatInline}>
                          Damage: {typeof selectedSkill.damage === 'object' ? JSON.stringify(selectedSkill.damage) : selectedSkill.damage}
                        </span>
                      )}
                      {selectedSkill.duration && (
                        <span className={styles.skillStatInline}>
                          Duration: {typeof selectedSkill.duration === 'object' ? JSON.stringify(selectedSkill.duration) : selectedSkill.duration}
                        </span>
                      )}
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
                    </div>

                    {selectedSkill.skill_description && (
                      <div 
                        className={styles.skillDetailDescription}
                        dangerouslySetInnerHTML={{ __html: selectedSkill.skill_description }}
                      />
                    )}
                  </div>
                </div>

                {/* Skill Parameters - Additional parameters not in level scaling */}
                {selectedSkill.skill_parameters && typeof selectedSkill.skill_parameters === 'object' && 
                 Object.keys(selectedSkill.skill_parameters).length > 0 && (
                  <div className={styles.skillParameters}>
                    {Object.entries(selectedSkill.skill_parameters).map(([key, value]) => {
                      let displayValue: string;
                      
                      if (typeof value === 'object' && value !== null) {
                        // Handle objects like {levels: [...], name: "..."}
                        if ('levels' in value && Array.isArray(value.levels)) {
                          displayValue = value.levels.join(' / ');
                        } else if ('name' in value) {
                          return null; // Skip objects with name (they go in level scaling)
                        } else {
                          displayValue = JSON.stringify(value);
                        }
                      } else {
                        displayValue = String(value);
                      }
                      
                      return (
                        <span key={key} className={styles.skillParamInline}>
                          {key}: {displayValue}
                        </span>
                      );
                    })}
                  </div>
                )}

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

                  const maxLevels = Math.max(...scalingData.map(item => item.levels?.length || 0));

                  return (
                    <div className={styles.levelScaling}>
                      <div className={styles.levelScalingTable}>
                        <table>
                          <thead>
                            <tr>
                              <th></th>
                              {Array.from({ length: maxLevels }, (_, i) => (
                                <th key={i}>Lv.{i + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {scalingData.map((param, idx) => (
                              <tr key={idx}>
                                <td className={styles.paramName}>{param.name}</td>
                                {param.levels?.map((value: any, levelIdx: number) => (
                                  <td key={levelIdx}>{value}</td>
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
        )}
    </div>
  );
}

export default HeroDetailPage;
