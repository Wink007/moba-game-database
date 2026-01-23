import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeroSidebarProps } from './interface';
import styles from '../styles.module.scss';

export const HeroSidebar: React.FC<HeroSidebarProps> = ({ hero }) => {
  const { t } = useTranslation();
  return (
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
          <span className={styles.sidebarInfoLabel}>{t('heroDetail.damageType')}</span>
          <span className={styles.sidebarInfoValue}>{hero.damage_type}</span>
        </div>
      )}

      {/* Lane */}
      {hero.lane && hero.lane.length > 0 && (
        <div className={styles.sidebarInfo}>
          <span className={styles.sidebarInfoLabel}>{t('heroDetail.lane')}</span>
          <span className={styles.sidebarInfoValue}>{hero.lane.join(', ')}</span>
        </div>
      )}
    </div>
  );
};
