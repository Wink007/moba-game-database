import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import styles from './styles.module.scss';

interface PatchSkill {
  type: string | null;
  name: string;
  balance: string | null;
  changes: string[];
}

interface SkillAdjustment {
  skill_type: string;
  skill_name?: string;
  badge?: string;
  description: string;
}

interface AttributeAdjustment {
  attribute_name: string;
  badge?: string;
  description: string;
}

interface PatchHeroChanges {
  summary?: string;
  skills?: PatchSkill[];
  badge?: string;
  description?: string;
  adjustments?: SkillAdjustment[];
  attribute_adjustments?: AttributeAdjustment[];
}

interface NewHeroSkill {
  skill_type?: string;
  type?: string;
  skill_name?: string;
  name?: string;
  description: string;
}

interface NewHero {
  name: string;
  title: string;
  description: string;
  skills: NewHeroSkill[];
}

interface BattlefieldSection {
  name: string;
  balance: string | null;
  changes: string[];
}

interface BattlefieldItem {
  description: string[];
  sections: BattlefieldSection[];
  changes: string[];
}

interface BattlefieldAdjustment {
  type?: 'section' | 'item';
  badge?: string;
  description?: string | string[];
  items?: Record<string, BattlefieldItem>;
  changes?: string[];
}

interface EquipmentAdjustmentItem {
  name?: string;
  badge?: string;
  description?: string;
}

interface ItemAdjustment {
  badge?: string;
  description?: string;
  adjustments?: (string | EquipmentAdjustmentItem)[];
}

interface RevampedHeroAdjustment {
  skill_type: string;
  skill_name: string;
  description: string;
}

interface RevampedHeroData {
  badge: string;
  description: string;
  adjustments: RevampedHeroAdjustment[];
}

interface SystemAdjustment {
  name: string;
  description: string;
}

interface Patch {
  version: string;
  release_date: string;
  designers_note?: string;
  new_hero: NewHero | null;
  hero_adjustments: Record<string, PatchHeroChanges>;
  emblem_adjustments: Record<string, { sections?: BattlefieldSection[]; badge?: string; description?: string; adjustments?: string[] }>;
  equipment_adjustments?: Record<string, ItemAdjustment>;
  battlefield_adjustments: Record<string, BattlefieldAdjustment>;
  system_adjustments: (string | SystemAdjustment)[];
  revamped_heroes?: string[];
  revamped_heroes_data?: Record<string, RevampedHeroData>;
}

export const PatchesPage: React.FC = () => {
  const { gameId, patchVersion } = useParams<{ gameId: string; patchVersion?: string }>();
  const navigate = useNavigate();
  const [patchVersions, setPatchVersions] = useState<Array<{version: string, release_date: string}>>([]);
  const [currentPatchData, setCurrentPatchData] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPatch, setLoadingPatch] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [heroNameToId, setHeroNameToId] = useState<Record<string, number>>({});
  const [itemNameToId, setItemNameToId] = useState<Record<string, number>>({});

  const handlePatchSelect = async (version: string) => {
    setSelectedPatch(version);
    // Оновлюємо URL при зміні патчу
    navigate(`/${gameId}/patches/patch_${version}`, { replace: true });
    
    // Завантажуємо повні дані патчу
    setLoadingPatch(true);
    try {
      const response = await fetch(`https://web-production-8570.up.railway.app/api/patches/${version}`);
      const patchData = await response.json();
      setCurrentPatchData(patchData);
    } catch (error) {
      console.error('Error fetching patch data:', error);
    } finally {
      setLoadingPatch(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only patch versions list with minimal data (only version + date)
        const patchesResponse = await fetch(`https://web-production-8570.up.railway.app/api/patches?minimal=true&limit=50`);
        const patchesData = await patchesResponse.json();
        
        setPatchVersions(patchesData);
        
        if (patchesData.length > 0) {
          // Якщо є параметр версії в URL, використовуємо його
          const versionFromUrl = patchVersion ? patchVersion.replace('patch_', '') : null;
          const patchToSelect = versionFromUrl && patchesData.find((p: any) => p.version === versionFromUrl)
            ? versionFromUrl
            : patchesData[0].version;
          
          // Якщо в URL немає версії, додаємо її
          if (!patchVersion) {
            navigate(`/${gameId}/patches/patch_${patchToSelect}`, { replace: true });
          }
          
          // Завантажуємо дані вибраного патчу
          const selectedPatchResponse = await fetch(`https://web-production-8570.up.railway.app/api/patches/${patchToSelect}`);
          const selectedPatchData = await selectedPatchResponse.json();
          setCurrentPatchData(selectedPatchData);
          setSelectedPatch(patchToSelect);
        }

        // Fetch heroes to build name -> id mapping (API already returns minimal data)
        const heroesResponse = await fetch(`https://web-production-8570.up.railway.app/api/heroes?game_id=2`);
        const heroesData = await heroesResponse.json();
        const heroMapping: Record<string, number> = {};
        heroesData.forEach((hero: any) => {
          heroMapping[hero.name] = hero.id;
        });
        setHeroNameToId(heroMapping);

        // Fetch items to build name -> id mapping (API already returns minimal data)
        const itemsResponse = await fetch(`https://web-production-8570.up.railway.app/api/items?game_id=2`);
        const itemsData = await itemsResponse.json();
        const itemMapping: Record<string, number> = {};
        itemsData.forEach((item: any) => {
          itemMapping[item.name] = item.id;
        });
        setItemNameToId(itemMapping);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameId, patchVersion]);

  // Ефект для скролу до якоря після завантаження
  useEffect(() => {
    if (!loading && selectedPatch) {
      // Чекаємо, поки контент відрендериться
      setTimeout(() => {
        const hash = window.location.hash.substring(1); // Забираємо #
        if (hash) {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    }
  }, [loading, selectedPatch]);

  const getBalanceBadgeClass = (balance: string) => {
    switch (balance.toUpperCase()) {
      case 'BUFF': return styles.buff;
      case 'NERF': return styles.nerf;
      case 'ADJUST': return styles.adjust;
      case 'REVAMP': return styles.revamp;
      default: return '';
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.patchesPage}>
      <div className={styles.patchSelector}>
        <div className={styles.patchVersions}>
          {patchVersions.map(patch => (
            <button
              key={patch.version}
              className={`${styles.patchButton} ${selectedPatch === patch.version ? styles.active : ''}`}
              onClick={() => handlePatchSelect(patch.version)}
            >
              {patch.version}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {loadingPatch ? (
          <Loader />
        ) : currentPatchData && (
          <>
            <div className={styles.header}>
              <h1>Patch {currentPatchData.version}</h1>
              <p className={styles.releaseDate}>{currentPatchData.release_date}</p>
            </div>

            {currentPatchData.designers_note && currentPatchData.designers_note.trim() && (
              <div className={styles.section}>
                <div className={styles.designersNote}>
                  <h2>Designer's Note</h2>
                  <p className={styles.noteContent} dangerouslySetInnerHTML={{ __html: currentPatchData.designers_note }} />
                </div>
              </div>
            )}

            {currentPatchData.new_hero && (
              <div className={styles.section}>
                <h2>New Hero</h2>
                <div className={styles.newHeroCard}>
                  <div className={styles.newHeroHeader}>
                    {heroNameToId[currentPatchData.new_hero.name] ? (
                      <Link to={`/${gameId}/heroes/${heroNameToId[currentPatchData.new_hero.name]}`} className={styles.newHeroLink}>
                        <h3>{currentPatchData.new_hero.name}</h3>
                      </Link>
                    ) : (
                      <h3>{currentPatchData.new_hero.name}</h3>
                    )}
                    <span className={styles.newHeroBadge}>NEW</span>
                  </div>
                  <p className={styles.newHeroTitle}>{currentPatchData.new_hero.title}</p>
                  <p className={styles.newHeroDescription}>
                    {currentPatchData.new_hero.description}
                  </p>
                  
                  <div className={styles.newHeroSkills}>
                    {currentPatchData.new_hero.skills.map((skill, idx) => (
                      <div key={idx} className={styles.newHeroSkill}>
                        <div className={styles.newHeroSkillHeader}>
                          <span className={styles.skillType}>{skill.skill_type || skill.type}</span>
                          <span className={styles.skillName}>{skill.skill_name || skill.name}</span>
                        </div>
                        <div className={styles.newHeroSkillDescription}>
                          {skill.description.split('\n\n').map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentPatchData.revamped_heroes && currentPatchData.revamped_heroes.length > 0 && currentPatchData.revamped_heroes_data && (
              <div className={styles.section}>
                <h2>Revamped Heroes</h2>
                {currentPatchData.revamped_heroes.map((heroName) => {
                  const heroData = currentPatchData.revamped_heroes_data![heroName];
                  if (!heroData) return null;
                  
                  return (
                    <div key={heroName} className={styles.revampedHeroCard}>
                      <div className={styles.heroHeader}>
                        {heroNameToId[heroName] ? (
                          <Link to={`/${gameId}/heroes/${heroNameToId[heroName]}`} className={styles.heroLink}>
                            <h3>{heroName}</h3>
                          </Link>
                        ) : (
                          <h3>{heroName}</h3>
                        )}
                        <span className={`${styles.badge} ${styles.revampBadge}`}>
                          REVAMP
                        </span>
                      </div>
                      
                      {heroData.description && heroData.description.trim() && (
                        <p className={styles.revampDescription}>
                          {heroData.description.split('\n\n').map((para, pIdx) => (
                            <span key={pIdx}>
                              {para}
                              {pIdx < heroData.description.split('\n\n').length - 1 && <><br /><br /></>}
                            </span>
                          ))}
                        </p>
                      )}
                      
                      {heroData.adjustments && heroData.adjustments.length > 0 && (
                        <div className={styles.revampedSkills}>
                          {heroData.adjustments.map((skill, idx) => (
                            <div key={idx} className={styles.skillBlock}>
                              <div className={styles.skillHeader}>
                                <span className={styles.skillType}>{skill.skill_type}</span>
                                <span className={styles.skillName}>{skill.skill_name}</span>
                              </div>
                              <div className={styles.skillDescription}>
                                {skill.description.split('\n\n').map((para, pIdx) => (
                                  <p key={pIdx}>{para}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {currentPatchData.hero_adjustments && Object.keys(currentPatchData.hero_adjustments).length > 0 && (
              <div className={styles.section}>
                <h2>Hero Adjustments</h2>
                {Object.entries(currentPatchData.hero_adjustments)
                  .filter(([heroName, heroData]) => {
                    // Фільтруємо героїв без даних
                    const hasSummary = heroData.summary && heroData.summary.trim().length > 0;
                    const hasSkills = heroData.skills && heroData.skills.length > 0;
                    const hasDescription = heroData.description && heroData.description.trim().length > 0;
                    const hasAdjustments = heroData.adjustments && heroData.adjustments.length > 0;
                    
                    // Виключаємо героя якщо він є у new_hero (щоб не дублювати)
                    const isNewHero = currentPatchData.new_hero && (
                      heroName === currentPatchData.new_hero.name || 
                      heroName.startsWith(currentPatchData.new_hero.name + ',')
                    );
                    
                    return (hasSummary || hasSkills || hasDescription || hasAdjustments) && !isNewHero;
                  })
                  .map(([heroName, heroData]) => (
                  <div key={heroName} id={heroName} className={styles.heroCard}>{/* Додали id={heroName} для якоря */}
                    <div className={styles.heroHeader}>
                      {heroNameToId[heroName] ? (
                        <Link to={`/${gameId}/heroes/${heroNameToId[heroName]}`} className={styles.heroLink}>
                          <h3>{heroName}</h3>
                        </Link>
                      ) : (
                        <h3>{heroName}</h3>
                      )}
                      {heroData.badge && (
                        <span className={`${styles.badge} ${getBalanceBadgeClass(heroData.badge)}`}>
                          {heroData.badge}
                        </span>
                      )}
                    </div>
                    
                    {heroData.summary && heroData.summary.trim() && (
                      <p className={styles.summary} dangerouslySetInnerHTML={{ __html: heroData.summary }} />
                    )}
                    
                    {heroData.description && heroData.description.trim() && (
                      <p className={styles.summary} dangerouslySetInnerHTML={{ __html: heroData.description }} />
                    )}

                    {heroData.skills && heroData.skills.length > 0 && heroData.skills.map((skill, idx) => (
                      <div key={idx} className={styles.skillBlock}>
                        <div className={styles.skillHeader}>
                          {skill.type && <span className={styles.skillType}>{skill.type}</span>}
                          <span className={styles.skillName}>{skill.name}</span>
                          {skill.balance && (
                            <span className={`${styles.badge} ${getBalanceBadgeClass(skill.balance)}`}>
                              {skill.balance}
                            </span>
                          )}
                        </div>
                        <ul className={styles.changesList}>
                          {skill.changes.map((change, changeIdx) => (
                            <li key={changeIdx}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    
                    {heroData.adjustments && heroData.adjustments.length > 0 && heroData.adjustments.map((adj, idx) => (
                      <div key={idx} className={styles.skillBlock}>
                        <div className={styles.skillHeader}>
                          <span className={styles.skillName}>{adj.skill_name || adj.skill_type}</span>
                          {adj.badge && (
                            <span className={`${styles.badge} ${getBalanceBadgeClass(adj.badge)}`}>
                              {adj.badge}
                            </span>
                          )}
                        </div>
                        {adj.description && (
                          <p className={styles.summary} dangerouslySetInnerHTML={{ __html: adj.description }} />
                        )}
                      </div>
                    ))}
                    
                    {heroData.attribute_adjustments && heroData.attribute_adjustments.length > 0 && heroData.attribute_adjustments.map((attr, idx) => (
                      <div key={idx} className={styles.skillBlock}>
                        <div className={styles.skillHeader}>
                          <span className={styles.skillName}>{attr.attribute_name}</span>
                          {attr.badge && (
                            <span className={`${styles.badge} ${getBalanceBadgeClass(attr.badge)}`}>
                              {attr.badge}
                            </span>
                          )}
                        </div>
                        {attr.description && (
                          <p className={styles.summary} dangerouslySetInnerHTML={{ __html: attr.description }} />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {currentPatchData.equipment_adjustments && Object.keys(currentPatchData.equipment_adjustments).length > 0 && (
              <div className={styles.section}>
                <h2>Equipment Adjustments</h2>
                {Object.entries(currentPatchData.equipment_adjustments).map(([itemName, itemData]) => (
                  <div key={itemName} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      {itemNameToId[itemName] ? (
                        <Link to={`/${gameId}/items/${itemNameToId[itemName]}`} className={styles.heroLink}>
                          <h4>{itemName}</h4>
                        </Link>
                      ) : (
                        <h4>{itemName}</h4>
                      )}
                      {itemData.badge && (
                        <span className={`${styles.badge} ${getBalanceBadgeClass(itemData.badge)}`}>
                          {itemData.badge}
                        </span>
                      )}
                    </div>
                    
                    {itemData.description && itemData.description.trim() && (
                      <p className={styles.summary} dangerouslySetInnerHTML={{ __html: itemData.description }} />
                    )}
                    
                    {itemData.adjustments && itemData.adjustments.length > 0 && (
                      <div>
                        {itemData.adjustments.map((adj, adjIdx) => {
                          // Підтримка старого формату (string) та нового (object)
                          if (typeof adj === 'string') {
                            return (
                              <div key={adjIdx} className={styles.skillBlock}>
                                <p className={styles.summary} dangerouslySetInnerHTML={{ __html: adj }} />
                              </div>
                            );
                          }
                          
                          return (
                            <div key={adjIdx} className={styles.skillBlock}>
                              <div className={styles.skillHeader}>
                                <span className={styles.skillName}>{adj.name}</span>
                                {adj.badge && (
                                  <span className={`${styles.badge} ${getBalanceBadgeClass(adj.badge)}`}>
                                    {adj.badge}
                                  </span>
                                )}
                              </div>
                              {adj.description && (
                                <p className={styles.summary} dangerouslySetInnerHTML={{ __html: adj.description }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {currentPatchData.emblem_adjustments && Object.keys(currentPatchData.emblem_adjustments).length > 0 && (
              <div className={styles.section}>
                <h2>Emblem Adjustments</h2>
                {Object.entries(currentPatchData.emblem_adjustments).map(([emblemName, emblemData]) => (
                  <div key={emblemName} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{emblemName}</h4>
                      {emblemData.badge && (
                        <span className={`${styles.badge} ${getBalanceBadgeClass(emblemData.badge)}`}>
                          {emblemData.badge}
                        </span>
                      )}
                    </div>
                    
                    {emblemData.description && emblemData.description.trim() && (
                      <p className={styles.summary} dangerouslySetInnerHTML={{ __html: emblemData.description }} />
                    )}
                    
                    {emblemData.adjustments && emblemData.adjustments.length > 0 && (
                      <ul className={styles.changesList}>
                        {emblemData.adjustments.map((adj, adjIdx) => (
                          <li key={adjIdx} dangerouslySetInnerHTML={{ __html: adj }} />
                        ))}
                      </ul>
                    )}
                    
                    {emblemData.sections && emblemData.sections.length > 0 && (
                      <div className={styles.sections}>
                        {emblemData.sections.map((section, sectionIdx) => (
                          <div key={sectionIdx} className={styles.skillBlock}>
                            <div className={styles.skillHeader}>
                              {section.name && <span className={styles.skillName}>{section.name}</span>}
                              {section.balance && (
                                <span className={`${styles.badge} ${getBalanceBadgeClass(section.balance)}`}>
                                  {section.balance}
                                </span>
                              )}
                            </div>
                            <ul className={styles.changesList}>
                              {section.changes.map((change, changeIdx) => (
                                <li key={changeIdx} dangerouslySetInnerHTML={{ __html: change }} />
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {currentPatchData.battlefield_adjustments && Object.keys(currentPatchData.battlefield_adjustments).length > 0 && (
              <div className={styles.section}>
                <h2>Battlefield Adjustments</h2>
                {Object.entries(currentPatchData.battlefield_adjustments).map(([sectionName, sectionData]) => {
                  // Якщо це секція з вкладеними items (Equipment Adjustments, Battle Spells)
                  if (sectionData.type === 'section' && sectionData.items && Object.keys(sectionData.items).length > 0) {
                    return (
                      <div key={sectionName} className={styles.battlefieldSection}>
                        <h3 className={styles.sectionTitle}>{sectionName}</h3>
                        
                        {Object.entries(sectionData.items).map(([itemName, itemData]) => (
                          <div key={itemName} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                              <h4>{itemName}</h4>
                            </div>
                            
                            {itemData.description && itemData.description.length > 0 && (
                              <div className={styles.description}>
                                {itemData.description.map((desc, idx) => (
                                  <p key={idx}>{desc}</p>
                                ))}
                              </div>
                            )}
                            
                            {itemData.sections && itemData.sections.length > 0 && (
                              <div className={styles.sections}>
                                {itemData.sections.map((section, sectionIdx) => (
                                  <div key={sectionIdx} className={styles.skillBlock}>
                                    <div className={styles.skillHeader}>
                                      {section.name && <span className={styles.skillName}>{section.name}</span>}
                                      {section.balance && (
                                        <span className={`${styles.badge} ${getBalanceBadgeClass(section.balance)}`}>
                                          {section.balance}
                                        </span>
                                      )}
                                    </div>
                                    <ul className={styles.changesList}>
                                      {section.changes.map((change, changeIdx) => (
                                        <li key={changeIdx}>{change}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {itemData.changes && itemData.changes.length > 0 && (
                              <ul className={styles.changesList}>
                                {itemData.changes.map((change, changeIdx) => (
                                  <li key={changeIdx}>{change}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  // Якщо це окремий item (Mythic Battlefield, Stat Adjustments) або новий формат з badge
                  if ((sectionData.type === 'item' || sectionData.badge || typeof sectionData.description === 'string') && 
                      ((sectionData.description && (typeof sectionData.description === 'string' ? sectionData.description.length > 0 : sectionData.description.length > 0)) || 
                       (sectionData.changes && sectionData.changes.length > 0))) {
                    const desc = sectionData.description;
                    const isStringDesc = typeof desc === 'string';
                    
                    return (
                      <div key={sectionName} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <h3>{sectionName}</h3>
                          {sectionData.badge && (
                            <span className={`${styles.badge} ${getBalanceBadgeClass(sectionData.badge)}`}>
                              {sectionData.badge}
                            </span>
                          )}
                        </div>
                        
                        {desc && (
                          <div className={styles.description}>
                            {isStringDesc ? (
                              <p dangerouslySetInnerHTML={{ __html: desc }} />
                            ) : (
                              desc.map((d, idx) => (
                                <p key={idx}>{d}</p>
                              ))
                            )}
                          </div>
                        )}
                        
                        {sectionData.changes && sectionData.changes.length > 0 && (
                          <ul className={styles.changesList}>
                            {sectionData.changes.map((change, changeIdx) => (
                              <li key={changeIdx}>{change}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            )}

            {currentPatchData.system_adjustments && currentPatchData.system_adjustments.length > 0 && (
              <div className={styles.section}>
                <h2>System Adjustments</h2>
                {currentPatchData.system_adjustments.map((adjustment, idx) => {
                  // Підтримка старого формату (string) та нового (object)
                  if (typeof adjustment === 'string') {
                    return (
                      <div key={idx} className={styles.itemCard}>
                        <p className={styles.summary}>{adjustment}</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx} className={styles.itemCard}>
                      <h4>{adjustment.name}</h4>
                      {adjustment.description && adjustment.description.trim() && (
                        <p className={styles.summary} dangerouslySetInnerHTML={{ __html: adjustment.description }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
