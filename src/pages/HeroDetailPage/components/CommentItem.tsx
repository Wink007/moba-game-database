import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Comment } from './useComments';
import styles from '../styles.module.scss';

interface CommentItemProps {
  comment: Comment;
  isOwn: boolean;
  liked: boolean;
  onLike: () => void;
  onDelete: () => void;
}

function timeAgo(dateStr: string, t: (key: string, opts?: object) => string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return t('comments.justNow');
  if (diff < 3600) return t('comments.minutesAgo', { n: Math.floor(diff / 60) });
  if (diff < 86400) return t('comments.hoursAgo', { n: Math.floor(diff / 3600) });
  return t('comments.daysAgo', { n: Math.floor(diff / 86400) });
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment: c, isOwn, liked, onLike, onDelete }) => {
  const { t } = useTranslation();
  const [pendingDelete, setPendingDelete] = useState(false);

  return (
    <li className={styles.commentItem}>
      <img
        className={styles.commentAvatar}
        src={c.author_picture || ''}
        alt={c.author_name}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <div className={styles.commentBody}>
        <div className={styles.commentMeta}>
          <span className={styles.commentAuthor}>{c.author_name}</span>
          <span className={styles.commentTime}>{timeAgo(c.created_at, t)}</span>
        </div>
        <p className={styles.commentText}>{c.text}</p>
        <div className={styles.commentActions}>
          <button
            className={`${styles.commentLikeBtn} ${liked ? styles.commentLikeBtnActive : ''}`}
            onClick={onLike}
          >
            <svg className={styles.commentLikeIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {c.likes > 0 && <span>{c.likes}</span>}
          </button>

          {isOwn && (
            pendingDelete ? (
              <>
                <button className={styles.commentConfirmYes} onClick={() => { onDelete(); setPendingDelete(false); }}>✓</button>
                <button className={styles.commentConfirmNo} onClick={() => setPendingDelete(false)}>✕</button>
              </>
            ) : (
              <button className={styles.commentDeleteBtn} onClick={() => setPendingDelete(true)}>
                {t('common.delete')}
              </button>
            )
          )}
        </div>
      </div>
    </li>
  );
};
