import { useTranslation } from 'react-i18next';
import { EmblemCardProps } from './interface';
import { getEmblemName, getEmblemDescription, getStatName } from '../../../utils/translation';
import { highlightValues } from '../../../utils/highlightValues';
import styles from './EmblemCard.module.scss';

export const EmblemCard = ({ emblem }: EmblemCardProps) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className={styles.emblemCard}>
      <div className={styles.emblemHeader}>
        {emblem.icon_url && (
          <div className={styles.emblemIconWrapper}>
            <img
              src={emblem.icon_url}
              alt={getEmblemName(emblem, lang)}
              className={styles.emblemIcon}
            />
          </div>
        )}
        <h2 className={styles.emblemName}>{getEmblemName(emblem, lang)}</h2>
      </div>
      
      {(emblem.description || emblem.description_uk) && (
        <p
          className={styles.emblemDescription}
          dangerouslySetInnerHTML={{ __html: highlightValues(getEmblemDescription(emblem, lang)) }}
        />
      )}

      {emblem.base_stats && Object.keys(emblem.base_stats).length > 0 && (
        <div className={styles.baseStats}>
          <div className={styles.statsTitle}>{t('emblems.stats')}</div>
          {Object.entries(emblem.base_stats).map(([stat, value]) => (
            <div key={stat} className={styles.statRow}>
              <span>{getStatName(stat, lang)}</span>
              <span className={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
