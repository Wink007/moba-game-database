import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeroSidebarProps } from './interface';
import { 
  getHeroName, 
  getHeroShortDescription, 
  translateRoles, 
  translateLanes, 
  translateSpecialties, 
  getDamageType 
} from '../../../utils/translation';
import styles from '../styles.module.scss';

export const HeroSidebar: React.FC<HeroSidebarProps> = ({ hero }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className={styles.heroSidebar}>
      {/* Hero Name in Sidebar */}
      <div className={styles.sidebarHeroName}>
        <h2>{getHeroName(hero, i18n.language)}</h2>
        {hero.roles && hero.roles.length > 0 && (
          <p className={styles.sidebarHeroRole}>
            {translateRoles(hero.roles, i18n.language).join(' • ')}
          </p>
        )}
      </div>

      {hero.image && (
        <div className={styles.heroPortrait}>
          <img src={hero.image} alt={getHeroName(hero, i18n.language)} />
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
      {(hero.short_description || hero.short_description_uk) && (
        <div className={styles.sidebarDescription}>
          <p>{getHeroShortDescription(hero, i18n.language)}</p>
        </div>
      )}

      {/* Specialty Tags */}
      {hero.specialty && hero.specialty.length > 0 && (
        <div className={styles.sidebarSpecialty}>
          <div className={styles.specialtyTags}>
            {translateSpecialties(hero.specialty, i18n.language).map((spec, idx) => (
              <span key={idx} className={styles.specialtyTag}>{spec}</span>
            ))}
          </div>
        </div>
      )}

      {/* Damage Type */}
      {hero.damage_type && (
        <div className={styles.sidebarInfo}>
          <span className={styles.sidebarInfoLabel}>{t('heroDetail.damageType')}</span>
          <span className={styles.sidebarInfoValue}>
            {getDamageType(hero.damage_type, i18n.language)}
          </span>
        </div>
      )}

      {/* Lane */}
      {hero.lane && hero.lane.length > 0 && (
        <div className={styles.sidebarInfo}>
          <span className={styles.sidebarInfoLabel}>{t('heroDetail.lane')}</span>
          <span className={styles.sidebarInfoValue}>
            {translateLanes(hero.lane, i18n.language).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};
