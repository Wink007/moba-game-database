import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import styles from './styles.module.scss';

interface PatchSkill {
  type: string;
  name: string;
  balance: string;
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

interface PatchSection {
  type: string;
  balance: string;
  changes: string[];
}

interface PatchItemChanges {
  description: string;
  sections: PatchSection[];
}

interface Patch {
  version: string;
  release_date: string;
  highlights: string[];
  new_hero: NewHero | null;
  hero_changes: Record<string, PatchHeroChanges>;
  item_changes: Record<string, PatchItemChanges>;
  system_changes: string[];
}

export const PatchesPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatch, setSelectedPatch] = useState<string | null>(null);
  const [heroNameToId, setHeroNameToId] = useState<Record<string, number>>({});
  const [itemNameToId, setItemNameToId] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patches
        const patchesResponse = await fetch(`https://web-production-8570.up.railway.app/api/patches`);
        const patchesData = await patchesResponse.json();
        
        // Convert object to array and sort by version
        const patchesArray = Object.entries(patchesData).map(([version, patchData]: [string, any]) => ({
          version,
          ...patchData
        }));
        
        setPatches(patchesArray);
        if (patchesArray.length > 0) {
          setSelectedPatch(patchesArray[0].version);
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
  }, [gameId]);

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
              onClick={() => setSelectedPatch(patch.version)}
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

            {currentPatch.highlights && currentPatch.highlights.length > 0 && (
              <div className={styles.section}>
                <h2>Highlights</h2>
                <ul className={styles.highlights}>
                  {currentPatch.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}

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
                    <strong>Hero Feature:</strong> {currentPatch.new_hero.description}
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

            {Object.keys(currentPatch.hero_changes).length > 0 && (
              <div className={styles.section}>
                <h2>Hero Adjustments</h2>
                {Object.entries(currentPatch.hero_changes).map(([heroName, heroData]) => (
                  <div key={heroName} className={styles.heroCard}>
                    <div className={styles.heroHeader}>
                      {heroNameToId[heroName] ? (
                        <Link to={`/${gameId}/heroes/${heroNameToId[heroName]}`} className={styles.heroLink}>
                          <h3>{heroName}</h3>
                        </Link>
                      ) : (
                        <h3>{heroName}</h3>
                      )}
                      {heroData.summary && (
                        <span className={`${styles.badge} ${getBalanceBadgeClass(
                          heroData.skills.length > 0 ? heroData.skills[0].balance : ''
                        )}`}>
                          {heroData.skills.length > 0 ? heroData.skills[0].balance : ''}
                        </span>
                      )}
                    </div>
                    
                    {heroData.summary && (
                      <p className={styles.summary}>{heroData.summary}</p>
                    )}

                    {heroData.skills.map((skill, idx) => (
                      <div key={idx} className={styles.skillBlock}>
                        <div className={styles.skillHeader}>
                          <span className={styles.skillType}>{skill.type}</span>
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

            {Object.keys(currentPatch.item_changes).length > 0 && (
              <div className={styles.section}>
                <h2>Equipment Adjustments</h2>
                {Object.entries(currentPatch.item_changes).map(([itemName, itemData]) => (
                  <div key={itemName} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      {itemNameToId[itemName] ? (
                        <Link to={`/${gameId}/items/${itemNameToId[itemName]}`} className={styles.itemLink}>
                          <h3>{itemName}</h3>
                        </Link>
                      ) : (
                        <h3>{itemName}</h3>
                      )}
                      {itemData.sections.length > 0 && itemData.sections[0].balance && (
                        <span className={`${styles.badge} ${getBalanceBadgeClass(itemData.sections[0].balance)}`}>
                          {itemData.sections[0].balance}
                        </span>
                      )}
                    </div>
                    
                    {itemData.description && (
                      <p className={styles.description}>{itemData.description}</p>
                    )}

                    {itemData.sections.map((section, idx) => (
                      <div key={idx} className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                          <span className={styles.sectionType}>{section.type}</span>
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
                ))}
              </div>
            )}

            {currentPatch.system_changes && currentPatch.system_changes.length > 0 && (
              <div className={styles.section}>
                <h2>System Adjustments</h2>
                <ul className={styles.systemChanges}>
                  {currentPatch.system_changes.map((change, idx) => (
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
