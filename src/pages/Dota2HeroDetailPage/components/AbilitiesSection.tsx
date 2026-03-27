import React, { useState } from 'react';
import type { Dota2Ability } from '../../../types/dota2';
import type { AbilitiesSectionProps } from './interface';
import styles from '../styles.module.scss';

const isTalentsEntry = (ab: any): boolean => ab.is_talents === true;

const AbilityCard: React.FC<{ ability: Dota2Ability }> = ({ ability }) => {
  const [expanded, setExpanded] = useState(true);
  const hasMeta =
    (ability.cooldowns?.some(v => v > 0) ?? false) ||
    (ability.mana_costs?.some(v => v > 0) ?? false) ||
    (ability.cast_ranges?.some(v => v > 0) ?? false);

  return (
    <div className={styles.abilityCard}>
      <div className={styles.abilityCardHeader} onClick={() => setExpanded(e => !e)}>
        <img src={ability.icon} alt={ability.name} className={styles.abilityCardIcon} loading="lazy" />
        <div className={styles.abilityCardHeaderInfo}>
          <div className={styles.abilityCardNameRow}>
            <span className={styles.abilityCardName}>{ability.name}</span>
            {ability.is_innate && <span className={styles.abilityBadge}>Innate</span>}
            {ability.has_scepter && <span className={`${styles.abilityBadge} ${styles.abilityBadgeScepter}`}>Aghs</span>}
            {ability.has_shard && <span className={`${styles.abilityBadge} ${styles.abilityBadgeShard}`}>Shard</span>}
          </div>
          {hasMeta && (
            <div className={styles.abilityCardMeta}>
              {ability.cooldowns?.some(v => v > 0) && (
                <span className={styles.abilityMetaItem}>⏱ {ability.cooldowns!.filter(v => v > 0).join(' / ')}s</span>
              )}
              {ability.mana_costs?.some(v => v > 0) && (
                <span className={styles.abilityMetaItem}>🔵 {ability.mana_costs!.filter(v => v > 0).join(' / ')}</span>
              )}
              {ability.cast_ranges?.some(v => v > 0) && (
                <span className={styles.abilityMetaItem}>🎯 {ability.cast_ranges!.filter(v => v > 0).join(' / ')}</span>
              )}
            </div>
          )}
        </div>
        <span className={`${styles.abilityChevron} ${expanded ? styles.abilityChevronOpen : ''}`}>▾</span>
      </div>

      {expanded && (
        <div className={styles.abilityCardBody}>
          {ability.description && (
            <p className={styles.abilityDetailDesc}>{ability.description}</p>
          )}
          {ability.scepter_desc && (
            <div className={styles.abilityUpgrade} data-type="scepter">
              <span className={styles.abilityUpgradeLabel}>✦ Aghanim's Scepter</span>
              <p>{ability.scepter_desc}</p>
            </div>
          )}
          {ability.shard_desc && (
            <div className={styles.abilityUpgrade} data-type="shard">
              <span className={styles.abilityUpgradeLabel}>◈ Aghanim's Shard</span>
              <p>{ability.shard_desc}</p>
            </div>
          )}
          {ability.lore && (
            <p className={styles.abilityLore}>{ability.lore}</p>
          )}
        </div>
      )}
    </div>
  );
};

export const AbilitiesSection: React.FC<AbilitiesSectionProps> = ({ abilities }) => {
  const regularAbilities = abilities.filter((ab) => !isTalentsEntry(ab)) as Dota2Ability[];

  if (regularAbilities.length === 0) return null;

  return (
    <div className={styles.abilitiesList}>
      {regularAbilities.map((ab) => (
        <AbilityCard key={ab.internal_name} ability={ab} />
      ))}
    </div>
  );
};
