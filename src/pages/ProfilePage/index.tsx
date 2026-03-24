import React, { useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useAuthStore, authFetch } from '../../store/authStore';
import { useSEO } from '../../hooks/useSEO';
import { useItemsQuery } from '../../queries/useItemsQuery';
import { useHeroesQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useBackHandler } from '../../hooks/useBackHandler';
import { queryKeys } from '../../queries/keys';
import { API_URL } from '../../config';
import type { Item } from '../../types';
import type { ProfileData } from './types';
import { ACTIVITY_LEVELS, LEVEL_THRESHOLDS } from './constants';
import { FollowsModal } from './components/FollowsModal';
import { BannerPickerModal } from './components/BannerPickerModal';
import { ActivityLevel } from './components/ActivityLevel';
import { MlbbSection } from './components/MlbbSection';
import { ProfileBanner } from './components/ProfileBanner';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileStatsBar } from './components/ProfileStatsBar';
import { ProfileBody } from './components/ProfileBody';
import { ProfileActions } from './components/ProfileActions';
import { DangerZone } from './components/DangerZone';
import styles from './styles.module.scss';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore(s => s.user);
  const setAuth = useAuthStore(s => s.setAuth);
  const token = useAuthStore(s => s.token);
  const numericUserId = Number(userId);
  const isOwnProfile = currentUser?.id === numericUserId;
  const queryClient = useQueryClient();
  const { selectedGameId } = useGameStore();

  // Nickname editing
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSaving, setNicknameSaving] = useState(false);

  // Banner picker
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Follow
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);

  // Follows modal
  const [followsModal, setFollowsModal] = useState<'followers' | 'following' | null>(null);
  const closeFollowsModal = useCallback(() => setFollowsModal(null), []);
  useBackHandler(!!followsModal, closeFollowsModal);

  // Profile tab
  const [searchParams] = useSearchParams();
  const [profileTab, setProfileTab] = useState<'profile' | 'mlbb'>(
    searchParams.get('tab') === 'mlbb' ? 'mlbb' : 'profile'
  );

  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const { data: heroes = [] } = useHeroesQuery(selectedGameId);

  useEscapeKey(() => { setShowBannerPicker(false); setShowCustomize(false); });

  const saveBannerHero = useCallback(async (heroId: number | null) => {
    setSaving(true);
    try {
      const res = await authFetch('/users/profile-settings', {
        method: 'PUT',
        body: JSON.stringify({ banner_hero_id: heroId }),
      });
      if (currentUser && token) {
        setAuth({ ...currentUser, banner_hero_id: res.banner_hero_id }, token);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
      setShowBannerPicker(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }, [currentUser, token, setAuth, queryClient, numericUserId]);

  const startEditNickname = useCallback(() => {
    setNicknameInput(currentUser?.nickname || '');
    setNicknameError('');
    setEditingNickname(true);
  }, [currentUser?.nickname]);

  const saveNickname = useCallback(async () => {
    const val = nicknameInput.trim();
    if (val && val.length < 2) { setNicknameError(t('profile.nicknameTooShort')); return; }
    if (val && val.length > 20) { setNicknameError(t('profile.nicknameTooLong')); return; }
    if (val && !/^[a-zA-Z0-9_\u0430-\u044f\u0410-\u042f\u0456\u0406\u0457\u0407\u0454\u0404\u0491\u0490\u0451\u0401]+$/.test(val)) {
      setNicknameError(t('profile.nicknameInvalid'));
      return;
    }
    setNicknameSaving(true);
    try {
      const res = await authFetch('/users/nickname', {
        method: 'PUT',
        body: JSON.stringify({ nickname: val || null }),
      });
      if (currentUser && token) setAuth({ ...currentUser, nickname: res.nickname }, token);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
      setEditingNickname(false);
    } catch (err: any) {
      const msg = err?.message || '';
      setNicknameError(msg.includes('already taken') || msg.includes('409') ? t('profile.nicknameTaken') : msg);
    } finally {
      setNicknameSaving(false);
    }
  }, [nicknameInput, t, currentUser, token, setAuth, queryClient, numericUserId]);

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: queryKeys.profile.user(numericUserId),
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = useAuthStore.getState().token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/users/${numericUserId}/profile`, { headers });
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
    enabled: !!numericUserId,
  });

  const { data: items = [] } = useItemsQuery(2);
  const itemsMap = useMemo(() => {
    const map = new Map<number, Item>();
    items.forEach((item: Item) => map.set(item.id, item));
    return map;
  }, [items]);

  useSEO({
    title: profile?.user?.name ? `${profile.user.name} — ${t('profile.title')}` : t('profile.title'),
    description: t('profile.seoDescription'),
    noindex: true,
  });

  React.useEffect(() => {
    if (profile?.is_following !== undefined) setIsFollowing(profile.is_following ?? null);
    if (profile?.followers_count !== undefined) setFollowersCount(profile.followers_count ?? 0);
  }, [profile?.is_following, profile?.followers_count]);

  const handleFollow = useCallback(async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      await authFetch(`/users/${numericUserId}/follow`, { method });
      setIsFollowing(v => !v);
      setFollowersCount(v => v + (isFollowing ? -1 : 1));
    } catch { /* ignore */ }
    finally { setFollowLoading(false); }
  }, [currentUser, followLoading, isFollowing, numericUserId]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    try { await authFetch('/users/account', { method: 'DELETE' }); logout(); navigate('/'); }
    catch { setDeleteConfirm(false); }
    finally { setDeleting(false); }
  }, [logout, navigate]);

  if (isLoading) return <Loader />;
  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>{t('profile.notFound')}</h2>
          <Link to="/">{t('notFound.backHome')}</Link>
        </div>
      </div>
    );
  }

  const { user, main_heroes, builds, favorites_count, favorites } = profile;
  const score = profile.activity_score ?? 0;
  const levelIdx = Math.min(
    LEVEL_THRESHOLDS.reduce((best, thr, i) => score >= thr ? i : best, 0),
    ACTIVITY_LEVELS.length - 1
  );

  return (
    <div className={styles.container}>

      <ProfileBanner
        user={user}
        isOwnProfile={isOwnProfile}
        onEditBanner={() => setShowBannerPicker(true)}
      />

      <ProfileHeader
        user={user}
        mainHeroes={main_heroes}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        followLoading={followLoading}
        currentUser={currentUser}
        activityTitle={score > 0 ? t(`profile.${ACTIVITY_LEVELS[levelIdx]}`) : ''}
        editingNickname={editingNickname}
        nicknameInput={nicknameInput}
        nicknameError={nicknameError}
        nicknameSaving={nicknameSaving}
        onStartEditNickname={startEditNickname}
        onNicknameChange={v => { setNicknameInput(v); setNicknameError(''); }}
        onSaveNickname={saveNickname}
        onCancelEditNickname={() => setEditingNickname(false)}
        onFollow={handleFollow}
      />

      <ProfileStatsBar
        buildsCount={builds.length}
        favoritesCount={favorites_count}
        followersCount={followersCount}
        followingCount={profile.following_count ?? 0}
        onOpenFollowers={() => setFollowsModal('followers')}
        onOpenFollowing={() => setFollowsModal('following')}
      />

      {followsModal && (
        <FollowsModal
          userId={numericUserId}
          type={followsModal}
          onClose={closeFollowsModal}
        />
      )}

      {score > 0 && <ActivityLevel score={score} />}

      {isOwnProfile && (
        <>
          <ProfileActions
            showCustomize={showCustomize}
            user={user}
            saving={saving}
            onToggleCustomize={() => setShowCustomize(v => !v)}
            onOpenBannerPicker={() => setShowBannerPicker(true)}
            onRemoveBanner={() => saveBannerHero(null)}
          />

          <div className={styles.profileTabs}>
            <button
              className={`${styles.profileTab} ${profileTab === 'profile' ? styles.profileTabActive : ''}`}
              onClick={() => setProfileTab('profile')}
            >
              {t('profile.mlbbProfileTab')}
            </button>
            <button
              className={`${styles.profileTab} ${profileTab === 'mlbb' ? styles.profileTabActive : ''}`}
              onClick={() => setProfileTab('mlbb')}
            >
              {t('profile.mlbbStatsTab')}
              {(user.mlbb_role_id || user.mlbb_nickname) && (
                <span className={styles.profileTabBadge}>✓</span>
              )}
            </button>
          </div>
        </>
      )}

      {isOwnProfile && profileTab === 'mlbb' && (
        <MlbbSection
          user={user}
          heroes={heroes}
          userId={numericUserId}
          onProfileRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) })}
        />
      )}

      {(!isOwnProfile || profileTab === 'profile') && (
        <ProfileBody
          isOwnProfile={isOwnProfile}
          user={user}
          mainHeroes={main_heroes}
          builds={builds}
          favorites={favorites}
          favoritesCount={favorites_count}
          itemsMap={itemsMap}
          selectedGameId={selectedGameId}
          onOpenMlbb={() => setProfileTab('mlbb')}
        />
      )}

      {isOwnProfile && (
        <DangerZone
          deleteConfirm={deleteConfirm}
          deleting={deleting}
          onSetDeleteConfirm={setDeleteConfirm}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {showBannerPicker && (
        <BannerPickerModal
          heroes={heroes}
          currentBannerHeroId={user.banner_hero_id}
          onSelect={saveBannerHero}
          onClose={() => setShowBannerPicker(false)}
          saving={saving}
        />
      )}

    </div>
  );
};

export default ProfilePage;
