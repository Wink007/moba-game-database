import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';
import { useGoogleAuth } from '../../../hooks/useGoogleAuth';
import { useComments } from './useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import styles from '../styles.module.scss';

interface CommentsSectionProps {
  heroId: number;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ heroId }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(5);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const googleLogin = useGoogleAuth(() => setShowLoginPrompt(false));

  const { comments, total, isLoading, isError, postMutation, deleteMutation, likeMutation } = useComments(heroId);

  const handleLike = (commentId: number) => {
    if (!user) { setShowLoginPrompt(true); return; }
    likeMutation.mutate(commentId, {
      onSuccess: (result: { liked: boolean }) => {
        setLikedIds(prev => {
          const next = new Set(prev);
          if (result.liked) next.add(commentId); else next.delete(commentId);
          return next;
        });
      },
    });
  };

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.commentsSectionTitle}>
        {t('comments.title')}
        {total > 0 && <span className={styles.commentsCount}>{total}</span>}
      </h3>

      <CommentForm
        onSubmit={text => postMutation.mutate(text)}
        isPending={postMutation.isPending}
        onShowLogin={() => setShowLoginPrompt(true)}
      />

      {showLoginPrompt && !user && (
        <div className={styles.commentLoginPrompt}>
          <span>{t('comments.loginRequired')}</span>
          <button className={styles.commentLoginBtn} onClick={() => googleLogin()}>
            {t('comments.signInGoogle')}
          </button>
          <button className={styles.commentDismissBtn} onClick={() => setShowLoginPrompt(false)}>✕</button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.commentsLoading}>
          {[1, 2, 3].map(i => <div key={i} className={styles.commentSkeleton} />)}
        </div>
      ) : isError || comments.length === 0 ? (
        <p className={styles.commentsEmpty}>{t('comments.empty')}</p>
      ) : (
        <>
          <ul className={styles.commentsList}>
            {comments.slice(0, visibleCount).map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                isOwn={user?.id === c.user_id}
                liked={likedIds.has(c.id)}
                onLike={() => handleLike(c.id)}
                onDelete={() => deleteMutation.mutate(c.id)}
              />
            ))}
          </ul>
          {visibleCount < comments.length && (
            <button className={styles.commentsLoadMore} onClick={() => setVisibleCount(v => v + 5)}>
              {t('comments.loadMore')}
            </button>
          )}
        </>
      )}
    </div>
  );
};
