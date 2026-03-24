import React from 'react';
import { useTranslation } from 'react-i18next';
import { NicknameForm } from './NicknameForm';
import type { ProfileHeaderProps } from '../types';
import styles from '../styles.module.scss';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  mainHeroes,
  isOwnProfile,
  isFollowing,
  followLoading,
  currentUser,
  activityTitle,
  editingNickname,
  nicknameInput,
  nicknameError,
  nicknameSaving,
  onStartEditNickname,
  onNicknameChange,
  onSaveNickname,
  onCancelEditNickname,
  onFollow,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.profileHeader}>
      <div className={styles.avatarWrap}>
        <img
          src={user.picture}
          alt={user.name}
          className={styles.avatar}
          referrerPolicy="no-referrer"
          decoding="async"
        />
        {mainHeroes.length > 0 && (
          <div className={styles.mainBadges}>
            {mainHeroes.slice(0, 3).map(h => (
              <img
                key={h.hero_id}
                src={h.head || h.image || ''}
                alt={h.name}
                className={styles.mainBadge}
                title={h.name}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.userInfo}>
        <div className={styles.nameRow}>
          <h1 className={styles.userName}>{user.nickname || user.name}</h1>
          {isOwnProfile && !editingNickname && user.nickname && (
            <button className={styles.nicknameEditBtn} onClick={onStartEditNickname} title={t('profile.nicknameEdit')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.subtitleRow}>
          {user.nickname && <span className={styles.realName}>{user.name}</span>}
          {activityTitle && <span className={styles.activityTitle}>{activityTitle}</span>}
        </div>

        {isOwnProfile && !editingNickname && !user.nickname && (
          <button className={styles.setNicknameBtn} onClick={onStartEditNickname}>
            {t('profile.nicknamePlaceholder')}
          </button>
        )}

        {isOwnProfile && editingNickname && (
          <NicknameForm
            value={nicknameInput}
            error={nicknameError}
            saving={nicknameSaving}
            onChange={onNicknameChange}
            onSave={onSaveNickname}
            onCancel={onCancelEditNickname}
          />
        )}

        {user.created_at && (
          <span className={styles.memberSince}>
            {t('profile.memberSince', {
              date: new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
            })}
          </span>
        )}

        {!isOwnProfile && currentUser && (
          <button
            className={`${styles.followBtn} ${isFollowing ? styles.followBtnActive : ''}`}
            onClick={onFollow}
            disabled={followLoading}
          >
            {isFollowing ? t('profile.unfollow') : t('profile.follow')}
          </button>
        )}
      </div>
    </div>
  );
};
