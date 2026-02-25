import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getHeroName, getHeroFullDescription } from '../../../utils/translation';
import { AboutTabProps } from './interface';
import styles from '../styles.module.scss';

export const AboutTab: React.FC<AboutTabProps> = React.memo(({ hero }) => {
  const { t, i18n } = useTranslation();
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!hero.full_description && !hero.full_description_uk) return null;

  const fullDescription = getHeroFullDescription(hero, i18n.language);

  return (
    <div className={styles.contentSection}>
      <div className={styles.descriptionSection}>
        <h3 className={styles.descriptionTitle}>
          {t('heroDetail.about', { name: getHeroName(hero, i18n.language) })}
        </h3>
        <p className={`${styles.descriptionText} ${!showFullDescription ? styles.descriptionTextCollapsed : ''}`}>
          {fullDescription}
        </p>
        {fullDescription.length > 300 && (
          <button
            className={styles.showMoreButton}
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? t('heroDetail.showLess') : t('heroDetail.showMore')}
          </button>
        )}
      </div>
    </div>
  );
});
