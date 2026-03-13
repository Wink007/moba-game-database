import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore, authFetch } from '../../../store/authStore';
import { useGoogleAuth } from '../../../hooks/useGoogleAuth';
import { queryKeys } from '../../../queries/keys';
import styles from '../styles.module.scss';

interface Comment {
  id: number;
  hero_id: number;
  user_id: number;
  text: string;
  likes: number;
  created_at: string;
  author_name: string;
  author_picture: string;
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
}

interface CommentsSectionProps {
  heroId: number;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'only now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ heroId }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const googleLogin = useGoogleAuth(() => setShowLoginPrompt(false));

  const { data, isLoading, isError } = useQuery<CommentsResponse>({
    queryKey: queryKeys.comments.hero(heroId),
    queryFn: () => authFetch(`/heroes/${heroId}/comments?size=50`),
    enabled: !!heroId,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const comments = data?.comments ?? [];

  const postMutation = useMutation({
    mutationFn: (commentText: string) =>
      authFetch(`/heroes/${heroId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.hero(heroId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) =>
      authFetch(`/comments/${commentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.hero(heroId) });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: number) =>
      authFetch(`/comments/${commentId}/like`, { method: 'POST' }),
    onSuccess: (result, commentId) => {
      setLikedIds(prev => {
        const next = new Set(prev);
        if (result.liked) next.add(commentId); else next.delete(commentId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.hero(heroId) });
    },
  });

  const submit = () => {
    if (!user) { setShowLoginPrompt(true); return; }
    const trimmed = text.trim();
    if (!trimmed || postMutation.isPending) return;
    postMutation.mutate(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.commentsSectionTitle}>
        {t('comments.title')}
        {(data?.total ?? 0) > 0 && (
          <span className={styles.commentsCount}>{data!.total}</span>
        )}
      </h3>

      {/* Input form */}
      <form className={styles.commentForm} onSubmit={handleSubmit}>
        {user ? (
          <img
            className={styles.commentAvatar}
            src={user.picture || ''}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.commentAvatarPlaceholder} />
        )}
        <div className={styles.commentInputWrap}>
          <div className={styles.commentInputBox}>
            <textarea
              className={styles.commentInput}
              placeholder={user ? t('comments.placeholder') : t('comments.loginToComment')}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              rows={text ? 3 : 1}
              onFocus={() => { if (!user) setShowLoginPrompt(true); }}
            />
            {text.trim() && (
              <div className={styles.commentInputActions}>
                <span className={styles.commentCharCount}>{text.length}/1000</span>
                <button
                  type="button"
                  className={styles.commentCancelBtn}
                  onClick={() => setText('')}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.commentSubmitBtn}
                  disabled={postMutation.isPending || !text.trim()}
                >
                  {postMutation.isPending ? '...' : t('comments.post')}
                </button>
              </div>
            )}
          </div>
          {text.trim() && (
            <p className={styles.commentHint}>Enter — send, Shift+Enter — new line</p>
          )}
        </div>
      </form>

      {/* Login prompt */}
      {showLoginPrompt && !user && (
        <div className={styles.commentLoginPrompt}>
          <span>{t('comments.loginRequired')}</span>
          <button className={styles.commentLoginBtn} onClick={() => googleLogin()}>
            {t('auth.signInWithGoogle')}
          </button>
          <button className={styles.commentDismissBtn} onClick={() => setShowLoginPrompt(false)}>✕</button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className={styles.commentsLoading}>
          {[1, 2, 3].map(i => <div key={i} className={styles.commentSkeleton} />)}
        </div>
      ) : isError ? (
        <p className={styles.commentsEmpty}>{t('comments.empty')}</p>
      ) : comments.length === 0 ? (
        <p className={styles.commentsEmpty}>{t('comments.empty')}</p>
      ) : (
        <ul className={styles.commentsList}>
          {comments.map(c => (
            <li key={c.id} className={styles.commentItem}>
              <img
                className={styles.commentAvatar}
                src={c.author_picture || ''}
                alt={c.author_name}
                referrerPolicy="no-referrer"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>{c.author_name}</span>
                  <span className={styles.commentTime}>{timeAgo(c.created_at)}</span>
                </div>
                <p className={styles.commentText}>{c.text}</p>
                <div className={styles.commentActions}>
                  <button
                    className={`${styles.commentLikeBtn} ${likedIds.has(c.id) ? styles.commentLikeBtnActive : ''}`}
                    onClick={() => {
                      if (!user) { setShowLoginPrompt(true); return; }
                      likeMutation.mutate(c.id);
                    }}
                  >
                    <span className={styles.commentLikeIcon}>♥</span>
                    {c.likes > 0 && <span>{c.likes}</span>}
                  </button>
                  {user?.id === c.user_id && (
                    <button
                      className={styles.commentDeleteBtn}
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
