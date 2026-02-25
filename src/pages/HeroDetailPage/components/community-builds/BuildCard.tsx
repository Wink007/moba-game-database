import React from 'react';
import { useTranslation } from 'react-i18next';
import { getEmblemName, getTalentName } from '../../../../utils/translation';
import type { BuildCardProps } from './interface';
import styles from '../../styles.module.scss';

export const BuildCard: React.FC<BuildCardProps> = React.memo(({
  build, isOwn, itemsMap, emblemsMap, spellsMap, talentsMap, onEdit, onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const buildItems = (build.items || []).map(id => itemsMap.get(id)).filter(Boolean);
  const emblem = build.emblem_id ? emblemsMap.get(build.emblem_id) : null;
  const spell1 = build.spell1_id ? spellsMap.get(build.spell1_id) : null;
  const spell2 = build.spell2_id ? spellsMap.get(build.spell2_id) : null;

  return (
    <div className={styles.cbCard}>
      <div className={styles.cbCardHeader}>
        <div className={styles.cbCardTitle}>
          <strong>{build.name}</strong>
          {build.author_name && !isOwn && (
            <span className={styles.cbAuthor}>
              {build.author_picture && (
                <img src={build.author_picture} alt="" className={styles.cbAuthorPic} referrerPolicy="no-referrer" />
              )}
              {build.author_name}
            </span>
          )}
        </div>
        {isOwn && (
          <div className={styles.cbCardActions}>
            <button onClick={() => onEdit(build)} className={styles.cbActionBtn} title={t('builds.edit')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button onClick={() => onDelete(build.id)} className={styles.cbActionBtn} title={t('builds.delete')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Items */}
      <div className={styles.pbItemsRow}>
        {buildItems.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className={styles.pbItemArrow}>›</span>}
            <div className={styles.pbItem} title={item?.name}>
              {item?.icon_url ? (
                <img src={item.icon_url} alt={item.name} className={styles.pbItemImg} loading="lazy" />
              ) : (
                <div className={styles.pbItemEmpty}>{idx + 1}</div>
              )}
              <span className={styles.pbItemLabel}>{item?.name || '???'}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Spell + Emblem */}
      <div className={styles.pbSetupRow}>
        {spell1 && (
          <div className={styles.pbSetupGroup}>
            <span className={styles.pbSetupGroupLabel}>Spell</span>
            <div className={styles.pbSetupItem}>
              {spell1.icon_url && <img src={spell1.icon_url} alt={spell1.name} className={styles.pbSetupIcon} loading="lazy" />}
              <span className={styles.pbSetupLabel}>{spell1.name}</span>
            </div>
            {spell2 && (
              <div className={styles.pbSetupItem}>
                {spell2.icon_url && <img src={spell2.icon_url} alt={spell2.name} className={styles.pbSetupIcon} loading="lazy" />}
                <span className={styles.pbSetupLabel}>{spell2.name}</span>
              </div>
            )}
          </div>
        )}
        {emblem && (
          <>
            {spell1 && <span className={styles.pbSetupDivider} />}
            <div className={styles.pbSetupGroup}>
              <span className={styles.pbSetupGroupLabel}>Emblem</span>
              <div className={styles.pbSetupGroupItems}>
                <div className={`${styles.pbSetupItem} ${styles.pbSetupItemEmblem}`}>
                  {emblem.icon_url && <img src={emblem.icon_url} alt={getEmblemName(emblem, lang)} className={styles.pbSetupIcon} loading="lazy" />}
                  <span className={styles.pbSetupLabel}>{getEmblemName(emblem, lang)}</span>
                </div>
                {build.talents && build.talents.map((name, tIdx) => {
                  const td = talentsMap.get(name);
                  return (
                    <div key={tIdx} className={styles.pbSetupItem}>
                      {td?.icon_url && <img src={td.icon_url} alt={td ? getTalentName(td, lang) : name} className={styles.pbSetupIcon} loading="lazy" />}
                      <span className={styles.pbSetupLabel}>{td ? getTalentName(td, lang) : name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {build.notes && <div className={styles.cbNotes}>{build.notes}</div>}
    </div>
  );
});
