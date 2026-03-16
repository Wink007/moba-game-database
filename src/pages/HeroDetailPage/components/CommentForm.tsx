import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';
import styles from '../styles.module.scss';

interface CommentFormProps {
  onSubmit: (text: string) => void;
  isPending: boolean;
  onShowLogin: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isPending, onShowLogin }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [text, setText] = useState('');

  const submit = () => {
    if (!user) { onShowLogin(); return; }
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <form
      className={styles.commentForm}
      onSubmit={e => { e.preventDefault(); submit(); }}
    >
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
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            maxLength={1000}
            rows={text ? 3 : 1}
            onFocus={() => { if (!user) onShowLogin(); }}
          />
          {text.trim() && (
            <div className={styles.commentInputActions}>
              <span className={styles.commentCharCount}>{text.length}/1000</span>
              <button type="button" className={styles.commentCancelBtn} onClick={() => setText('')}>
                {t('common.cancel')}
              </button>
              <button type="submit" className={styles.commentSubmitBtn} disabled={isPending || !text.trim()}>
                {isPending ? '...' : t('comments.post')}
              </button>
            </div>
          )}
        </div>
        {text.trim() && <p className={styles.commentHint}>{t('comments.hint')}</p>}
      </div>
    </form>
  );
};
