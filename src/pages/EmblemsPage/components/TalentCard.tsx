import React from 'react';
import { useTranslation } from 'react-i18next';
import { TalentCardProps } from './interface';
import { getTalentName, getTalentEffect } from '../../../utils/translation';
import { highlightValues } from '../../../utils/highlightValues';
import styles from './TalentCard.module.scss';

export const TalentCard: React.FC<TalentCardProps> = ({ talent }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className={styles.talentCard}>
      <div className={styles.talentHeader}>
        {talent.icon_url && (
          <div className={styles.talentIconWrapper}>
            <img
              src={talent.icon_url}
              alt={getTalentName(talent, lang)}
              className={styles.talentIcon}
            />
          </div>
        )}
        <h4 className={styles.talentName}>{getTalentName(talent, lang)}</h4>
      </div>
      <p
        className={styles.talentEffect}
        dangerouslySetInnerHTML={{ __html: highlightValues(getTalentEffect(talent, lang)) }}
      />
    </div>
  );
};
