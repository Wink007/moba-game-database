import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { usePatchData } from './hooks/usePatchData';
import { PatchHeader } from './components/PatchHeader';
import styles from './styles.module.scss';

export const PatchesPage: React.FC = () => {
  const { t } = useTranslation();
  const { gameId, patchVersion } = useParams<{ gameId: string; patchVersion?: string }>();
  
  const {
    patchVersions,
    currentPatchData,
    loading,
    loadingPatch,
    selectedPatch,
    heroNameToId,
    itemNameToId,
    handlePatchSelect,
  } = usePatchData({ gameId, patchVersion });

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

  const getBadgeText = (badge: string) => {
    switch (badge.toUpperCase()) {
      case 'BUFF': return t('patches.buffs');
      case 'NERF': return t('patches.nerfs');
      case 'ADJUST': return t('patches.adjustments');
      case 'REVAMP': return t('patches.rework');
      default: return badge;
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
            <PatchHeader
              version={currentPatchData.version}
              releaseDate={currentPatchData.release_date}
              designersNote={currentPatchData.designers_note}
            />

            {currentPatchData.new_hero && (
              <div className={styles.section}>
                <h2>{t('patches.newHero')}</h2>
                <div className={styles.newHeroCard}>
                  <div className={styles.newHeroHeader}>
                    {heroNameToId[currentPatchData.new_hero.name] ? (
                      <Link to={`/${gameId}/heroes/${heroNameToId[currentPatchData.new_hero.name]}`} className={styles.newHeroLink}>
                        <h3>{currentPatchData.new_hero.name}</h3>
                      </Link>
                    ) : (
                      <h3>{currentPatchData.new_hero.name}</h3>
                    )}
                    <span className={styles.newHeroBadge}>{t('patches.newHero')}</span>
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
                <h2>{t('patches.revampedHeroes')}</h2>
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
                          {t('patches.rework')}
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
                <h2>{t('patches.heroChanges')}</h2>
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
                          {getBadgeText(heroData.badge)}
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
                              {getBadgeText(skill.balance)}
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
                              {getBadgeText(adj.badge)}
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
                              {getBadgeText(attr.badge)}
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
                <h2>{t('patches.itemChanges')}</h2>
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
                          {getBadgeText(itemData.badge)}
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
                                    {getBadgeText(adj.badge)}
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
                <h2>{t('patches.adjustments')}</h2>
                {Object.entries(currentPatchData.emblem_adjustments).map(([emblemName, emblemData]) => (
                  <div key={emblemName} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{emblemName}</h4>
                      {emblemData.badge && (
                        <span className={`${styles.badge} ${getBalanceBadgeClass(emblemData.badge)}`}>
                          {getBadgeText(emblemData.badge)}
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
                                  {getBadgeText(section.balance)}
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
                <h2>{t('patches.systemChanges')}</h2>
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
                                          {getBadgeText(section.balance)}
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
                              {getBadgeText(sectionData.badge)}
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
                <h2>{t('patches.systemChanges')}</h2>
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
