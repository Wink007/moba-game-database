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

interface PatchHeroChanges {
  summary: string;
  skills: PatchSkill[];
}

interface NewHeroSkill {
  type: string;
  name: string;
  description: string;
}

interface NewHero {
  name: string;
  title: string;
  description: string;
  skills: NewHeroSkill[];
}

interface BattlefieldSubcategory {
  name: string;
  changes: string[];
}

interface BattlefieldAdjustment {
  description: string[];
  subcategories: BattlefieldSubcategory[];
  changes: string[];
}

interface Patch {
  version: string;
  release_date: string;
  new_hero: NewHero | null;
  hero_adjustments: Record<string, PatchHeroChanges>;
  battlefield_adjustments: Record<string, BattlefieldAdjustment>;
  system_adjustments: string[];
}

export const PatchesPage: React.FC = () => {
  const { gameId, patchVersion } = useParams<{ gameId: string; patchVersion?: string }>();
  const navigate = useNavigate();
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [heroNameToId, setHeroNameToId] = useState<Record<string, number>>({});
  const [itemNameToId, setItemNameToId] = useState<Record<string, number>>({});

  const handlePatchSelect = (version: string) => {
    setSelectedPatch(version);
    // Оновлюємо URL при зміні патчу
    navigate(`/${gameId}/patches/patch_${version}`, { replace: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patches
        const patchesResponse = await fetch(`https://web-production-8570.up.railway.app/api/patches`);
        const patchesData = await patchesResponse.json();
        
        // patchesData вже є масивом
        setPatches(patchesData);
        if (patchesData.length > 0) {
          // Якщо є параметр версії в URL, використовуємо його
          const versionFromUrl = patchVersion ? patchVersion.replace('patch_', '') : null;
          const patchToSelect = versionFromUrl && patchesData.find((p: Patch) => p.version === versionFromUrl)
            ? versionFromUrl
            : patchesData[0].version;
          setSelectedPatch(patchToSelect);
          
          // Якщо в URL немає версії, додаємо її
          if (!patchVersion) {
            navigate(`/${gameId}/patches/patch_${patchToSelect}`, { replace: true });
          }
        }

        // Fetch heroes to build name -> id mapping
        const heroesResponse = await fetch(`https://web-production-8570.up.railway.app/api/heroes?game_id=2`);
        const heroesData = await heroesResponse.json();
        const heroMapping: Record<string, number> = {};
        heroesData.forEach((hero: any) => {
          heroMapping[hero.name] = hero.id;
        });
        setHeroNameToId(heroMapping);

        // Fetch items to build name -> id mapping
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

  const currentPatch = patches.find(p => p.version === selectedPatch);

  return (
    <div className={styles.patchesPage}>
      <div className={styles.patchSelector}>
        <div className={styles.patchVersions}>
          {patches.map(patch => (
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
        {currentPatch && (
          <>
            <div className={styles.header}>
              <h1>Patch {currentPatch.version}</h1>
              <p className={styles.releaseDate}>{currentPatch.release_date}</p>
            </div>

            {currentPatch.new_hero && (
              <div className={styles.section}>
                <h2>New Hero</h2>
                <div className={styles.newHeroCard}>
                  <div className={styles.newHeroHeader}>
                    {heroNameToId[currentPatch.new_hero.name] ? (
                      <Link to={`/${gameId}/heroes/${heroNameToId[currentPatch.new_hero.name]}`} className={styles.newHeroLink}>
                        <h3>{currentPatch.new_hero.name}</h3>
                      </Link>
                    ) : (
                      <h3>{currentPatch.new_hero.name}</h3>
                    )}
                    <span className={styles.newHeroBadge}>NEW</span>
                  </div>
                  <p className={styles.newHeroTitle}>{currentPatch.new_hero.title}</p>
                  <p className={styles.newHeroDescription}>
                    {currentPatch.new_hero.description}
                  </p>
                  
                  <div className={styles.newHeroSkills}>
                    {currentPatch.new_hero.skills.map((skill, idx) => (
                      <div key={idx} className={styles.newHeroSkill}>
                        <div className={styles.newHeroSkillHeader}>
                          <span className={styles.skillType}>{skill.type}</span>
                          <span className={styles.skillName}>{skill.name}</span>
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

            {currentPatch.hero_adjustments && Object.keys(currentPatch.hero_adjustments).length > 0 && (
              <div className={styles.section}>
                <h2>Hero Adjustments</h2>
                {Object.entries(currentPatch.hero_adjustments)
                  .filter(([heroName, heroData]) => {
                    // Фільтруємо героїв без даних
                    const hasSummary = heroData.summary && heroData.summary.trim().length > 0;
                    const hasSkills = heroData.skills && heroData.skills.length > 0;
                    
                    // Виключаємо героя якщо він є у new_hero (щоб не дублювати)
                    const isNewHero = currentPatch.new_hero && (
                      heroName === currentPatch.new_hero.name || 
                      heroName.startsWith(currentPatch.new_hero.name + ',')
                    );
                    
                    return (hasSummary || hasSkills) && !isNewHero;
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
                    </div>
                    
                    {heroData.summary && heroData.summary.trim() && (
                      <p className={styles.summary}>{heroData.summary}</p>
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
                  </div>
                ))}
              </div>
            )}

            {currentPatch.battlefield_adjustments && Object.keys(currentPatch.battlefield_adjustments).length > 0 && (
              <div className={styles.section}>
                <h2>Battlefield Adjustments</h2>
                {Object.entries(currentPatch.battlefield_adjustments)
                  .filter(([name, data]) => 
                    (data.description && data.description.length > 0) ||
                    (data.subcategories && data.subcategories.length > 0) ||
                    (data.changes && data.changes.length > 0)
                  )
                  .map(([itemName, itemData]) => (
                  <div key={itemName} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h3>{itemName}</h3>
                    </div>
                    
                    {itemData.description && itemData.description.length > 0 && (
                      <div className={styles.description}>
                        {itemData.description.map((desc, idx) => (
                          <p key={idx}>{desc}</p>
                        ))}
                      </div>
                    )}
                    
                    {itemData.subcategories && itemData.subcategories.length > 0 && (
                      <div className={styles.subcategories}>
                        {itemData.subcategories.map((sub, subIdx) => (
                          <div key={subIdx} className={styles.subcategory}>
                            <h4>{sub.name}</h4>
                            <ul className={styles.changesList}>
                              {sub.changes.map((change, changeIdx) => (
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
            )}

            {currentPatch.system_adjustments && currentPatch.system_adjustments.length > 0 && (
              <div className={styles.section}>
                <h2>System Adjustments</h2>
                <ul className={styles.systemChanges}>
                  {currentPatch.system_adjustments.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
