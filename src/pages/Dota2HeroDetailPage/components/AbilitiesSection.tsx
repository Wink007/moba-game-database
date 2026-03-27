import React, { useState } from 'react';
import type { Dota2Ability } from '../../../types/dota2';
import type { AbilitiesSectionProps } from './interface';
import styles from '../styles.module.scss';

const isTalentsEntry = (ab: any): boolean => ab.is_talents === true;

const AbilityDetail: React.FC<{ ability: Dota2Ability }> = ({ ability }) => (
  <div className={styles.abilityDetail}>
    <div className={styles.abilityDetailHeader}>
      <img src={ability.icon} alt={ability.name} className={styles.abilityDetailIcon} />
      <div>
        <h3 className={styles.abilityDetailName}>
          {ability.name}
          {ability.is_innate && <span className={styles.abilityBadge}>Innate</span>}
        </h3>
        {ability.description && (
          <p className={styles.abilityDetailDesc}>{ability.description}</p>
        )}
      </div>
    </div>

    {/* Cooldown / Mana */}
    {((ability.cooldowns?.length ?? 0) > 0 || (ability.mana_costs?.length ?? 0) > 0) && (
      <div className={styles.abilityMeta}>
        {(ability.cooldowns?.length ?? 0) > 0 && (
          <span className={styles.abilityMetaItem}>
            ⏱ {ability.cooldowns!.join(' / ')}s
          </span>
        )}
        {(ability.mana_costs?.length ?? 0) > 0 && ability.mana_costs!.some(v => v > 0) && (
          <span className={styles.abilityMetaItem}>
            🔵 {ability.mana_costs!.join(' / ')}
          </span>
        )}
        {(ability.cast_ranges?.length ?? 0) > 0 && ability.cast_ranges!.some(v => v > 0) && (
          <span className={styles.abilityMetaItem}>
            🎯 {ability.cast_ranges!.join(' / ')}
          </span>
        )}
      </div>
    )}

    {/* Aghanim's upgrades */}
    {ability.scepter_desc && (
      <div className={styles.abilityUpgrade} data-type="scepter">
        <span className={styles.abilityUpgradeLabel}>Aghanim's Scepter</span>
        <p>{ability.scepter_desc}</p>
      </div>
    )}
    {ability.shard_desc && (
      <div className={styles.abilityUpgrade} data-type="shard">
        <span className={styles.abilityUpgradeLabel}>Aghanim's Shard</span>
        <p>{ability.shard_desc}</p>
      </div>
    )}

    {ability.lore && (
      <p className={styles.abilityLore}>{ability.lore}</p>
    )}
  </div>
);

export const AbilitiesSection: React.FC<AbilitiesSectionProps> = ({ abilities }) => {
  const [selected, setSelected] = useState(0);

  const regularAbilities = abilities.filter((ab) => !isTalentsEntry(ab)) as Dota2Ability[];
  const selectedAbility = regularAbilities[selected];

  if (regularAbilities.length === 0) return null;

  return (
    <div className={styles.abilitiesSection}>
      <div className={styles.abilityTabs}>
        {regularAbilities.map((ab, idx) => (
          <button
            key={ab.internal_name}
            className={`${styles.abilityTab} ${selected === idx ? styles.abilityTabActive : ''}`}
            onClick={() => setSelected(idx)}
            title={ab.name}
          >
            <img src={ab.icon} alt={ab.name} className={styles.abilityTabIcon} loading="lazy" />
            {ab.is_innate && <span className={styles.abilityTabInnate} />}
          </button>
        ))}
      </div>

      {selectedAbility && <AbilityDetail ability={selectedAbility} />}
    </div>
  );
};
