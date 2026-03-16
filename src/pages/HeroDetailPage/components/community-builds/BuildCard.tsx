import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getEmblemName, getTalentName } from '../../../../utils/translation';
import type { BuildCardProps } from './interface';
import styles from '../../styles.module.scss';

export const BuildCard: React.FC<BuildCardProps> = React.memo(({
  build, isOwn, itemsMap, emblemsMap, spellsMap, talentsMap, onEdit, onDelete, onVote,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const buildItems = (build.items || []).map(id => itemsMap.get(id)).filter(Boolean);
  const emblem = build.emblem_id ? emblemsMap.get(build.emblem_id) : null;
  const spell1 = build.spell1_id ? spellsMap.get(build.spell1_id) : null;
  const spell2 = build.spell2_id ? spellsMap.get(build.spell2_id) : null;

  const score = (build.upvotes || 0) - (build.downvotes || 0);
  const userVote = build.user_vote || 0;

  return (
    <div className={styles.cbCard}>
      <div className={styles.cbCardHeader}>
        <div className={styles.cbCardTitle}>
          <strong>{build.name}</strong>
          {build.author_name && !isOwn && (
            <Link
              to={build.author_id ? `/profile/${build.author_id}` : '#'}
              className={styles.cbAuthor}
              onClick={(e) => !build.author_id && e.preventDefault()}
            >
              {build.author_picture && (
                <img src={build.author_picture} alt="" className={styles.cbAuthorPic} referrerPolicy="no-referrer" />
              )}
              {build.author_name}
            </Link>
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
            {confirmDelete ? (
              <>
                <button onClick={() => { onDelete(build.id); setConfirmDelete(false); }} className={styles.cbActionBtn} title={t('common.yes')} style={{ color: '#22c55e' }}>✓</button>
                <button onClick={() => setConfirmDelete(false)} className={styles.cbActionBtn} title={t('common.cancel')} style={{ color: '#ef4444' }}>✕</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className={styles.cbActionBtn} title={t('builds.delete')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
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
            <span className={styles.pbSetupGroupLabel}>{t('builds.spells')}</span>
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
              <span className={styles.pbSetupGroupLabel}>{t('builds.emblem')}</span>
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

      {/* Vote buttons — only for community builds (not own) */}
      {!isOwn && onVote && (
        <div className={styles.cbVoteRow}>
          <button
            className={`${styles.cbVoteBtn} ${userVote === 1 ? styles.cbVoteActive : ''}`}
            onClick={() => onVote(build.id, userVote === 1 ? 0 : 1)}
            title={t('builds.upvote')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </button>
          <span className={`${styles.cbVoteScore} ${score > 0 ? styles.cbVotePositive : score < 0 ? styles.cbVoteNegative : ''}`}>
            {score}
          </span>
          <button
            className={`${styles.cbVoteBtn} ${userVote === -1 ? styles.cbVoteActive : ''}`}
            onClick={() => onVote(build.id, userVote === -1 ? 0 : -1)}
            title={t('builds.downvote')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 20l8-8h-5V4H9v8H4z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});
