import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '../../../store/authStore';
import { queryKeys } from '../../../queries/keys';
import type { MlbbHeroStat, MlbbSectionProps } from '../types';
import { MlbbStats } from './MlbbStats';
import { MlbbLinkForm } from './MlbbLinkForm';
import styles from '../styles.module.scss';

export const MlbbSection: React.FC<MlbbSectionProps> = ({ user, heroes, userId, onProfileRefresh }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkedSuccess, setLinkedSuccess] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [season, setSeason] = useState(0);

  const isLinked = !!(user.mlbb_role_id || user.mlbb_nickname);

  const { data: mlbbData, error: statsError, isFetching } = useQuery<{
    stats: MlbbHeroStat[];
    seasons: number[];
  }>({
    queryKey: ['mlbb-stats', userId, season],
    queryFn: () => authFetch(`/users/mlbb/stats?season=${season}`),
    enabled: isLinked && !tokenExpired,
    select: (res: any) => ({ stats: res.stats ?? [], seasons: res.seasons ?? [] }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!statsError) return;
    const err = statsError as any;
    if (err?.code === 'token_expired' || err?.code === 'not_linked' || err?.status === 401 || String(err?.message).includes('token expired')) {
      setTokenExpired(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(userId) });
    }
  }, [statsError, queryClient, userId]);

  const handleUnlink = async () => {
    setUnlinkLoading(true);
    try {
      await authFetch('/users/mlbb/unlink', { method: 'DELETE' });
      setLinkedSuccess('');
      onProfileRefresh();
    } catch { /* ignore */ }
    finally { setUnlinkLoading(false); }
  };

  const handleLinked = (nickname: string) => {
    setLinkedSuccess(nickname);
    setShowLinkForm(false);
    setTokenExpired(false);
    onProfileRefresh();
  };

  if (isLinked) {
    return (
      <div className={styles.mlbbSection}>
        <div className={styles.mlbbLinked}>
          {user.mlbb_avatar && <img src={user.mlbb_avatar} alt="" className={styles.mlbbAvatar} />}
          <div className={styles.mlbbLinkedInfo}>
            <span className={styles.mlbbLinkedLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f97316' }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              {t('profile.mlbbLinked')}
            </span>
            <span className={styles.mlbbLinkedName}>{user.mlbb_nickname || `ID: ${user.mlbb_role_id}`}</span>
          </div>
          <button className={styles.mlbbUnlinkBtn} onClick={handleUnlink} disabled={unlinkLoading}>
            {t('profile.mlbbUnlink')}
          </button>
        </div>

        {tokenExpired ? (
          <div className={styles.mlbbError} style={{ marginTop: 8 }}>
            {t('profile.mlbbSessionExpired')}
          </div>
        ) : isFetching ? (
          <div className={styles.mlbbSkeletonList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.mlbbSkeletonCard}>
                <div className={styles.mlbbSkeletonAvatar} />
                <div className={styles.mlbbSkeletonLines}>
                  <div className={styles.mlbbSkeletonLine} style={{ width: '40%' }} />
                  <div className={styles.mlbbSkeletonLine} style={{ width: '70%', height: 8 }} />
                </div>
                <div className={styles.mlbbSkeletonStats}>
                  {[0, 1, 2].map(j => <div key={j} className={styles.mlbbSkeletonStat} />)}
                </div>
              </div>
            ))}
          </div>
        ) : statsError && !tokenExpired ? (
          <div className={styles.mlbbError} style={{ marginTop: 8 }}>
            {(statsError as any)?.message || t('profile.mlbbStatsError')}
          </div>
        ) : mlbbData?.stats.length === 0 ? (
          <div className={styles.mlbbEmpty} style={{ marginTop: 16, textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            {t('profile.mlbbNoStats')}
          </div>
        ) : mlbbData && mlbbData.stats.length > 0 ? (
          <MlbbStats
            stats={mlbbData.stats}
            seasons={mlbbData.seasons}
            heroes={heroes}
            season={season}
            onSeasonChange={setSeason}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.mlbbSection}>
      {linkedSuccess && (
        <div className={styles.mlbbSuccessMsg}>✓ {linkedSuccess} {t('profile.mlbbLinkedSuccess')}</div>
      )}
      {!showLinkForm ? (
        <button className={styles.mlbbLinkBtn} onClick={() => setShowLinkForm(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7H13V9H17C18.65 9 20 10.35 20 12C20 13.65 18.65 15 17 15H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7ZM11 15H7C5.35 15 4 13.65 4 12C4 10.35 5.35 9 7 9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15ZM8 11H16V13H8V11Z" />
          </svg>
          {t('profile.mlbbLinkBtn')}
        </button>
      ) : (
        <MlbbLinkForm onLinked={handleLinked} onClose={() => setShowLinkForm(false)} />
      )}
    </div>
  );
};
