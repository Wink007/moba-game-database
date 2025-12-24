import { useParams } from 'react-router-dom';
import React from 'react';
import { useHero, useHeroSkillsById } from '../../hooks/useHeroes';
import { Loader } from '../../components/Loader';
import styles from './styles.module.scss';

function HeroDetailPage() {
  const { heroId } = useParams();
  const { data: hero, isLoading: heroLoading, isError: heroError } = useHero(Number(heroId));
  console.log('hero: ', hero);
  const { data: skills = [], isLoading: skillsLoading } = useHeroSkillsById(Number(heroId));
  const [selectedSkillId, setSelectedSkillId] = React.useState<number | null>(null);
  const [activeTab, setActiveTab] = React.useState<'info' | 'ratings' | 'counter' | 'relations'>('info');

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
            {hero.hero_stats && (
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
        </div>

        <div className={styles.heroMainContent}>
          {/* Hero Title */}
          <div className={styles.heroTitleSection}>
            <h1 className={styles.heroName}>{hero.name}</h1>
            {hero.short_description && (
              <p className={styles.heroDescription}>{hero.short_description}</p>
            )}
          </div>

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
              className={`${styles.tabButton} ${activeTab === 'ratings' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('ratings')}
            >
              Ratings
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'counter' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('counter')}
            >
              Counter Data
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'relations' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('relations')}
            >
              Relations
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
                      <span className={styles.statValueLarge}>{hero.hero_stats?.physical_attack || 'N/A'}</span>
                    </div>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Physical Defense</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.physical_defense || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.statsTableRow}>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Magic Power</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.magic_power ?? 'N/A'}</span>
                    </div>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Magic Defense</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.magic_defense || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.statsTableRow}>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Attack Speed</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.attack_speed || 'N/A'}</span>
                    </div>
                    <div className={styles.statsTableCell}>
                      <span className={styles.statName}>Movement Speed</span>
                      <span className={styles.statValueLarge}>{hero.hero_stats?.movement_speed || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Hero Details */}
                {(hero.roles || hero.specialty || hero.lane) && (
                  <div className={styles.heroDetailsGrid}>
                      {hero.roles && hero.roles.length > 0 && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>ROLE</span>
                          <span className={styles.detailValue}>{hero.roles.join(', ')}</span>
                        </div>
                      )}
                      {hero.specialty && hero.specialty.length > 0 && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>SPECIALTY</span>
                          <span className={styles.detailValue}>{hero.specialty.join(', ')}</span>
                        </div>
                      )}
                      {hero.lane && hero.lane.length > 0 && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>LANE</span>
                          <span className={styles.detailValue}>{hero.lane.join(', ')}</span>
                        </div>
                      )}
                    </div>
                )}
              </div>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <div className={styles.contentSection}>
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
              </div>
            )}

            {/* Counter Data Tab */}
            {activeTab === 'counter' && (
              <div className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Counter Information</h2>
                <p className={styles.comingSoon}>Counter data will be displayed here</p>
              </div>
            )}

            {/* Relations Tab */}
            {activeTab === 'relations' && (
              <div className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>Hero Relations</h2>
                <p className={styles.comingSoon}>Relations data will be displayed here</p>
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
              </div>
            ))}
          </div>

          {/* Selected Skill Detail */}
            {selectedSkill && (
              <div className={styles.skillDetail}>
                <div className={styles.skillDetailHeader}>
                  {selectedSkill.image && (
                    <div className={styles.skillDetailIcon}>
                      <img src={selectedSkill.image} alt={selectedSkill.skill_name} />
                    </div>
                  )}
                  <div className={styles.skillDetailInfo}>
                    <h3 className={styles.skillDetailName}>{selectedSkill.skill_name}</h3>
                    {selectedSkill.skill_description && (
                      <p className={styles.skillDetailDescription}>{selectedSkill.skill_description}</p>
                    )}
                  </div>
                </div>

                {/* Skill Stats Grid */}
                <div className={styles.skillStatsGrid}>
                  {selectedSkill.cooldown && (
                    <div className={styles.skillStatItem}>
                      <div className={styles.skillStatLabel}>COOLDOWN</div>
                      <div className={styles.skillStatValue}>{selectedSkill.cooldown}</div>
                    </div>
                  )}
                  {selectedSkill.mana_cost && (
                    <div className={styles.skillStatItem}>
                      <div className={styles.skillStatLabel}>MANA COST</div>
                      <div className={styles.skillStatValue}>{selectedSkill.mana_cost}</div>
                    </div>
                  )}
                  {selectedSkill.cast_range && (
                    <div className={styles.skillStatItem}>
                      <div className={styles.skillStatLabel}>CAST RANGE</div>
                      <div className={styles.skillStatValue}>{selectedSkill.cast_range}</div>
                    </div>
                  )}
                  {selectedSkill.damage && (
                    <div className={styles.skillStatItem}>
                      <div className={styles.skillStatLabel}>DAMAGE</div>
                      <div className={styles.skillStatValue}>{selectedSkill.damage}</div>
                    </div>
                  )}
                  {selectedSkill.duration && (
                    <div className={styles.skillStatItem}>
                      <div className={styles.skillStatLabel}>DURATION</div>
                      <div className={styles.skillStatValue}>{selectedSkill.duration}</div>
                    </div>
                  )}
                </div>

                {/* Ability Details */}
                {selectedSkill.effect && selectedSkill.effect.length > 0 && (
                  <div className={styles.abilityDetails}>
                    <div className={styles.abilityDetailsTitle}>ABILITY DETAILS:</div>
                    <div className={styles.abilityDetailsGrid}>
                      {selectedSkill.effect.map((effect, idx) => (
                        <div key={idx} className={styles.abilityDetailItem}>
                          {typeof effect === 'string' ? effect : JSON.stringify(effect)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSkill.skill_type && (
                  <div className={styles.skillTypeBadge}>
                    {selectedSkill.skill_type}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default HeroDetailPage;
