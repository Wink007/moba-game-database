import React, { useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { heroToSlug } from '../../utils/heroSlug';
import { Loader } from '../../components/Loader';
import { MainHeroSelector } from '../../components/MainHeroSelector';
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
import styles from './styles.module.scss';

interface ProfileData {
  user: {
    id: number;
    name: string;
    picture: string;
    created_at: string;
    nickname?: string | null;
    banner_hero_id?: number | null;
    banner_image?: string | null;
    banner_painting?: string | null;
    banner_hero_name?: string | null;
    mlbb_role_id?: string | null;
    mlbb_zone_id?: string | null;
    mlbb_nickname?: string | null;
    mlbb_avatar?: string | null;
  };
  main_heroes: Array<{
    hero_id: number;
    position: number;
    name: string;
    head?: string;
    image?: string;
    game_id?: number;
  }>;
  builds: Array<{
    id: number;
    hero_id: number;
    name: string;
    hero_name: string;
    hero_head?: string;
    hero_image?: string;
    items: number[];
    upvotes: number;
    downvotes: number;
    user_vote?: number;
    created_at: string;
  }>;
  favorites_count: number;
  favorites: Array<{
    id: number;
    name: string;
    head?: string;
    image?: string;
    game_id?: number;
  }>;
  activity_title?: string;
  activity_score?: number;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

// Activity level system — MLBB ranks
const ACTIVITY_LEVELS = [
  'rank_warrior',
  'rank_elite',
  'rank_master',
  'rank_grandmaster',
  'rank_epic',
  'rank_legend',
  'rank_mythic',
  'rank_mythic_honor',
  'rank_mythic_glory',
  'rank_immortal',
];

// Score thresholds per level — must match backend TITLE_TIERS in api_server.py
// Formula: days*1 + builds*5 + favorites*1 + mains*2 + upvotes*3
const LEVEL_THRESHOLDS = [0, 10, 25, 30, 50, 80, 120, 140, 180, 250];

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

  // Banner & accent color
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [bannerSearch, setBannerSearch] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);

  // MLBB linking
  const [showMlbbLink, setShowMlbbLink] = useState(false);
  const [mlbbStep, setMlbbStep] = useState<'form' | 'code'>('form');
  const [mlbbRoleId, setMlbbRoleId] = useState('');
  const [mlbbZoneId, setMlbbZoneId] = useState('');
  const [mlbbVc, setMlbbVc] = useState('');
  const [mlbbLoading, setMlbbLoading] = useState(false);
  const [mlbbError, setMlbbError] = useState('');
  const [mlbbSuccess, setMlbbSuccess] = useState('');
  const [mlbbTokenExpired, setMlbbTokenExpired] = useState(false);
  const [mlbbSortKey, setMlbbSortKey] = useState<'total_games'|'win_rate'|'kda'|'mvp'|'avg_kills'|'avg_damage'>('total_games');
  const [mlbbSortAsc, setMlbbSortAsc] = useState(false);
  const [mlbbSeason, setMlbbSeason] = useState(0);
  const [mlbbVisible, setMlbbVisible] = useState(10);
  const [mlbbExpanded, setMlbbExpanded] = useState<Set<number>>(new Set());
  const toggleMlbbRow = (heroId: number) => setMlbbExpanded(prev => {
    const next = new Set(prev);
    next.has(heroId) ? next.delete(heroId) : next.add(heroId);
    return next;
  });
  const [searchParams] = useSearchParams();
  const [profileTab, setProfileTab] = useState<'profile' | 'mlbb'>(
    searchParams.get('tab') === 'mlbb' ? 'mlbb' : 'profile'
  );

  // Follows modal
  const [followsModal, setFollowsModal] = useState<'followers' | 'following' | null>(null);
  const [followsUsers, setFollowsUsers] = useState<Array<{id: number; name: string; picture: string}>>([]);
  const [followsLoading, setFollowsLoading] = useState(false);

  const closeFollowsModal = useCallback(() => setFollowsModal(null), []);
  useBackHandler(!!followsModal, closeFollowsModal);

  const openFollowsModal = async (type: 'followers' | 'following') => {
    setFollowsModal(type);
    setFollowsUsers([]);
    setFollowsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${numericUserId}/${type}`);
      const data = await res.json();
      setFollowsUsers(data);
    } catch { /* ignore */ }
    finally { setFollowsLoading(false); }
  };

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
    if (val && val.length < 2) {
      setNicknameError(t('profile.nicknameTooShort'));
      return;
    }
    if (val && val.length > 20) {
      setNicknameError(t('profile.nicknameTooLong'));
      return;
    }
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
      // Update local auth store
      if (currentUser && token) {
        setAuth({ ...currentUser, nickname: res.nickname }, token);
      }
      // Refresh profile
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
      setEditingNickname(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already taken') || msg.includes('409')) {
        setNicknameError(t('profile.nicknameTaken'));
      } else {
        setNicknameError(msg);
      }
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

  // MLBB stats — only fetch when own profile AND account is linked (has role_id)
  const { data: mlbbData, error: mlbbStatsError, isFetching: mlbbFetching } = useQuery<{
    stats: Array<{
      hero_id: number; total_games: number; wins: number; win_rate: number;
      mvp: number; kda: number; level: number;
      avg_kills: number; avg_deaths: number; avg_assists: number;
      max_kills: number; max_kda: number;
      avg_damage: number; avg_taken: number;
      penta_kills: number; quadra_kills: number; triple_kills: number; double_kills: number;
    }>;
    seasons: number[];
  }>({
    queryKey: ['mlbb-stats', numericUserId, mlbbSeason],
    queryFn: () => authFetch(`/users/mlbb/stats?season=${mlbbSeason}`),
    enabled: isOwnProfile && !!currentUser && !mlbbTokenExpired && !!(profile?.user?.mlbb_role_id || profile?.user?.mlbb_nickname),
    select: (res: any) => ({ stats: res.stats ?? [], seasons: res.seasons ?? [] }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const mlbbStats = mlbbData?.stats ?? [];
  const mlbbSeasons = mlbbData?.seasons ?? [];

  // Detect expired MLBB token
  React.useEffect(() => {
    if (!mlbbStatsError) return;
    const err = mlbbStatsError as any;
    if (err?.code === 'token_expired' || err?.code === 'not_linked' || err?.status === 401 || String(err?.message).includes('token expired')) {
      setMlbbTokenExpired(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
    }
  }, [mlbbStatsError, queryClient, numericUserId]);

  // Load items for MLBB (game_id = 2) — used to render item icons in builds
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

  // Sync follow state from API response
  React.useEffect(() => {
    if (profile?.is_following !== undefined) setIsFollowing(profile.is_following ?? null);
    if (profile?.followers_count !== undefined) setFollowersCount(profile.followers_count ?? 0);
  }, [profile?.is_following, profile?.followers_count]);

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      await authFetch(`/users/${numericUserId}/follow`, { method });
      setIsFollowing(v => !v);
      setFollowersCount(v => v + (isFollowing ? -1 : 1));
    } catch { /* ignore */ }
    finally { setFollowLoading(false); }
  };

  const handleMlbbSendCode = async () => {
    setMlbbError('');
    if (!mlbbRoleId.trim() || !mlbbZoneId.trim()) {
      setMlbbError('Fill in both fields');
      return;
    }
    setMlbbLoading(true);
    try {
      await authFetch('/users/mlbb/send-code', {
        method: 'POST',
        body: JSON.stringify({ roleId: mlbbRoleId.trim(), zoneId: mlbbZoneId.trim() }),
      });
      setMlbbStep('code');
    } catch (err: any) {
      setMlbbError(err?.message || 'Failed to send code');
    } finally {
      setMlbbLoading(false);
    }
  };

  const handleMlbbVerify = async () => {
    setMlbbError('');
    if (!mlbbVc.trim()) { setMlbbError('Enter the code'); return; }
    setMlbbLoading(true);
    try {
      const res = await authFetch('/users/mlbb/verify', {
        method: 'POST',
        body: JSON.stringify({ roleId: mlbbRoleId.trim(), zoneId: mlbbZoneId.trim(), vc: mlbbVc.trim() }),
      });
      setMlbbSuccess(res.mlbb_nickname || 'Linked!');
      setShowMlbbLink(false);
      setMlbbStep('form');
      setMlbbVc('');
      setMlbbTokenExpired(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
    } catch (err: any) {
      setMlbbError(err?.message || 'Invalid code');
    } finally {
      setMlbbLoading(false);
    }
  };

  const handleMlbbUnlink = async () => {
    setMlbbLoading(true);
    try {
      await authFetch('/users/mlbb/unlink', { method: 'DELETE' });
      setMlbbSuccess('');
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
    } catch { /* ignore */ }
    finally { setMlbbLoading(false); }
  };

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
  const currentLevelIdx = LEVEL_THRESHOLDS.reduce((best, threshold, i) => score >= threshold ? i : best, 0);
  const levelIdx = Math.min(currentLevelIdx, ACTIVITY_LEVELS.length - 1);
  const isMaxLevel = levelIdx >= ACTIVITY_LEVELS.length - 1;
  const nextThreshold = isMaxLevel ? LEVEL_THRESHOLDS[levelIdx] : LEVEL_THRESHOLDS[levelIdx + 1];
  const prevThreshold = LEVEL_THRESHOLDS[levelIdx];
  const levelProgress = isMaxLevel ? 100 : Math.round(((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100);

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : '';

  const bannerImg = user.banner_painting || user.banner_image;
  const filteredHeroes = bannerSearch
    ? heroes.filter((h: any) => h.name.toLowerCase().includes(bannerSearch.toLowerCase()))
    : heroes;

  return (
    <div className={styles.container}>

      {/* ── Banner ── */}
      {bannerImg ? (
        <div className={styles.banner}>
          <img src={bannerImg} alt={user.banner_hero_name || ''} className={styles.bannerImg} loading="lazy" decoding="async" />
          <div className={styles.bannerOverlay} />
          {isOwnProfile && (
            <button className={styles.bannerEditBtn} onClick={() => { setBannerSearch(''); setShowBannerPicker(true); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
              {t('profile.bannerChange')}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.bannerNoBanner} />
      )}

      {/* ── Profile Header ── */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          <img src={user.picture} alt={user.name} className={styles.avatar} referrerPolicy="no-referrer" decoding="async" />
          {main_heroes.length > 0 && (
            <div className={styles.mainBadges}>
              {main_heroes.slice(0, 3).map(h => (
                <img key={h.hero_id} src={h.head || h.image || ''} alt={h.name} className={styles.mainBadge} title={h.name} loading="lazy" />
              ))}
            </div>
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameRow}>
            <h1 className={styles.userName}>{user.nickname || user.name}</h1>
            {isOwnProfile && !editingNickname && user.nickname && (
              <button className={styles.nicknameEditBtn} onClick={startEditNickname} title={t('profile.nicknameEdit')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
              </button>
            )}
          </div>

          <div className={styles.subtitleRow}>
            {user.nickname && <span className={styles.realName}>{user.name}</span>}
            {score > 0 && (
              <span className={styles.activityTitle}>{t(`profile.${ACTIVITY_LEVELS[levelIdx]}`)}</span>
            )}
          </div>

          {isOwnProfile && !editingNickname && !user.nickname && (
            <button className={styles.setNicknameBtn} onClick={startEditNickname}>
              {t('profile.nicknamePlaceholder')}
            </button>
          )}
          {isOwnProfile && editingNickname && (
            <div className={styles.nicknameForm}>
              <input
                className={styles.nicknameInput}
                value={nicknameInput}
                onChange={e => { setNicknameInput(e.target.value); setNicknameError(''); }}
                placeholder={t('profile.nicknamePlaceholder')}
                maxLength={20}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') saveNickname();
                  if (e.key === 'Escape') setEditingNickname(false);
                }}
              />
              <button className={styles.nicknameSaveBtn} onClick={saveNickname} disabled={nicknameSaving}>
                {t('profile.nicknameSave')}
              </button>
              <button className={styles.nicknameCancelBtn} onClick={() => setEditingNickname(false)}>
                {t('profile.nicknameCancel')}
              </button>
              {nicknameError && <span className={styles.nicknameError}>{nicknameError}</span>}
            </div>
          )}

          {memberSince && <span className={styles.memberSince}>{t('profile.memberSince', { date: memberSince })}</span>}

          {/* Follow button — only on other's profiles */}
          {!isOwnProfile && currentUser && (
            <button
              className={`${styles.followBtn} ${isFollowing ? styles.followBtnActive : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {isFollowing ? t('profile.unfollow') : t('profile.follow')}
            </button>
          )}
        </div>

      </div>

      {/* ── Stats Bar ── */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{builds.length}</span>
          <span className={styles.statLabel}>{t('profile.builds')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{favorites_count}</span>
          <span className={styles.statLabel}>{t('profile.favorites')}</span>
        </div>
        <button className={`${styles.stat} ${styles.statBtn}`} onClick={() => openFollowsModal('followers')}>
          <span className={styles.statValue}>{followersCount}</span>
          <span className={styles.statLabel}>{t('profile.followers')}</span>
        </button>
        <button className={`${styles.stat} ${styles.statBtn}`} onClick={() => openFollowsModal('following')}>
          <span className={styles.statValue}>{profile.following_count ?? 0}</span>
          <span className={styles.statLabel}>{t('profile.following')}</span>
        </button>
      </div>

      {/* ── Follows Modal ── */}
      {followsModal && (
        <div className={styles.followsOverlay} onClick={() => setFollowsModal(null)}>
          <div className={styles.followsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.followsModalHeader}>
              <h3>{t(`profile.${followsModal}`)}</h3>
              <button className={styles.followsModalClose} onClick={() => setFollowsModal(null)}>✕</button>
            </div>
            <div className={styles.followsModalBody}>
              {followsLoading && <div className={styles.followsLoader}>{t('common.loading') || '...'}</div>}
              {!followsLoading && followsUsers.length === 0 && (
                <div className={styles.followsEmpty}>{t('profile.noUsers') || '—'}</div>
              )}
              {followsUsers.map(u => (
                <Link key={u.id} to={`/profile/${u.id}`} className={styles.followsUserRow} onClick={() => setFollowsModal(null)}>
                  <img src={u.picture} alt={u.name} className={styles.followsUserAvatar} referrerPolicy="no-referrer" />
                  <span className={styles.followsUserName}>{u.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Level ── */}
      {score > 0 && (
        <div className={styles.levelBlock}>
          <div className={styles.levelHeader}>
            <div className={styles.levelInfo}>
              <span className={styles.levelNum}>Lv.{levelIdx + 1}</span>
              <span className={styles.levelTitle}>{t(`profile.${ACTIVITY_LEVELS[levelIdx]}`)}</span>
            </div>
            <div className={styles.levelScore}>
              <span>{score}</span>
              {!isMaxLevel && <span className={styles.levelScoreNext}>/ {nextThreshold} {t('profile.xp')}</span>}
            </div>
          </div>
          <div className={styles.levelBarTrack}>
            <div
              className={styles.levelBarFill}
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          {!isMaxLevel && (
            <div className={styles.levelNextRow}>
              <span>{t('profile.nextLevel')}: </span>
              <span className={styles.levelNextTitle}>{t(`profile.${ACTIVITY_LEVELS[levelIdx + 1]}`)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Own profile actions ── */}
      {isOwnProfile && (
        <div className={styles.actionsRow}>
          <button className={styles.customizeBtn} onClick={() => setShowCustomize(v => !v)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM21.32 9.55l-1.16-.54a7.06 7.06 0 00-.54-1.3l.42-1.2a.5.5 0 00-.12-.52l-1.42-1.42a.5.5 0 00-.52-.12l-1.2.42a7.06 7.06 0 00-1.3-.54l-.54-1.16A.5.5 0 0014.5 3h-2a.5.5 0 00-.44.27l-.54 1.16c-.46.13-.89.31-1.3.54l-1.2-.42a.5.5 0 00-.52.12L7.08 6.09a.5.5 0 00-.12.52l.42 1.2c-.23.41-.41.84-.54 1.3l-1.16.54A.5.5 0 005.5 10v2a.5.5 0 00.18.44l1.16.54c.13.46.31.89.54 1.3l-.42 1.2a.5.5 0 00.12.52l1.42 1.42a.5.5 0 00.52.12l1.2-.42c.41.23.84.41 1.3.54l.54 1.16a.5.5 0 00.44.18h2a.5.5 0 00.44-.27l.54-1.16c.46-.13.89-.31 1.3-.54l1.2.42a.5.5 0 00.52-.12l1.42-1.42a.5.5 0 00.12-.52l-.42-1.2c.23-.41.41-.84.54-1.3l1.16-.54A.5.5 0 0018.5 13v-2a.5.5 0 00-.18-.45z"/></svg>
            {t('profile.customize')}
          </button>
        </div>
      )}

      {isOwnProfile && showCustomize && (
        <div className={styles.customizePanel}>
          <div className={styles.customizeRow}>
            <span className={styles.customizeLabel}>{t('profile.banner')}</span>
            <div className={styles.customizeActions}>
              <button className={styles.customizeActionBtn} onClick={() => { setBannerSearch(''); setShowBannerPicker(true); }}>
                {t('profile.bannerChange')}
              </button>
              {user.banner_hero_id && (
                <button className={styles.customizeRemoveBtn} onClick={() => saveBannerHero(null)} disabled={saving}>
                  {t('profile.bannerRemove')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Tabs ── */}
      {isOwnProfile && (
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
            {(user.mlbb_role_id || user.mlbb_nickname) && <span className={styles.profileTabBadge}>✓</span>}
          </button>
        </div>
      )}

      {/* ── MLBB Account ── */}
      {isOwnProfile && profileTab === 'mlbb' && (
        <div className={styles.mlbbSection}>
          {(user.mlbb_role_id || user.mlbb_nickname) ? (
            <>
              <div className={styles.mlbbLinked}>
                {user.mlbb_avatar && <img src={user.mlbb_avatar} alt="" className={styles.mlbbAvatar} />}
                <div className={styles.mlbbLinkedInfo}>
                  <span className={styles.mlbbLinkedLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{color:'#f97316'}}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    {t('profile.mlbbLinked')}
                  </span>
                  <span className={styles.mlbbLinkedName}>{user.mlbb_nickname || `ID: ${user.mlbb_role_id}`}</span>
                </div>
                <button className={styles.mlbbUnlinkBtn} onClick={handleMlbbUnlink} disabled={mlbbLoading}>
                  {t('profile.mlbbUnlink')}
                </button>
              </div>
              {mlbbTokenExpired ? (
                <div className={styles.mlbbError} style={{marginTop: 8}}>
                  {t('profile.mlbbSessionExpired')}
                </div>
              ) : (
                <>
                  {mlbbFetching ? (
                    <div className={styles.mlbbSkeletonList}>
                      {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className={styles.mlbbSkeletonCard}>
                          <div className={styles.mlbbSkeletonAvatar} />
                          <div className={styles.mlbbSkeletonLines}>
                            <div className={styles.mlbbSkeletonLine} style={{width: '40%'}} />
                            <div className={styles.mlbbSkeletonLine} style={{width: '70%', height: 8}} />
                          </div>
                          <div className={styles.mlbbSkeletonStats}>
                            {[0,1,2].map(j => <div key={j} className={styles.mlbbSkeletonStat} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : mlbbStatsError && !mlbbTokenExpired ? (
                    <div className={styles.mlbbError} style={{marginTop: 8}}>
                      {(mlbbStatsError as any)?.message || t('profile.mlbbStatsError')}
                    </div>
                  ) : !mlbbFetching && mlbbStats.length === 0 && mlbbData !== undefined ? (
                    <div className={styles.mlbbEmpty} style={{marginTop: 16, textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13}}>
                      {t('profile.mlbbNoStats')}
                    </div>
                  ) : mlbbStats.length > 0 && (() => {
                    const sorted = [...mlbbStats].sort((a, b) => {
                      const v = (a[mlbbSortKey] ?? 0) as number;
                      const w = (b[mlbbSortKey] ?? 0) as number;
                      return mlbbSortAsc ? v - w : w - v;
                    });
                    return (
                      <div className={styles.mlbbStats}>
                        <div className={styles.mlbbStatsHeader}>
                          <span className={styles.mlbbStatsTitle}>
                            {t('profile.mlbbHeroStats')}
                            <span className={styles.mlbbStatsCount}>{mlbbStats.length}</span>
                          </span>
                        </div>
                        <div className={styles.mlbbControls}>
                          {mlbbSeasons.length > 0 && (
                            <div className={styles.mlbbSeasonSelect}>
                              <select
                                className={styles.mlbbSeasonDropdown}
                                value={mlbbSeason}
                                onChange={e => { setMlbbSeason(Number(e.target.value)); setMlbbVisible(10); }}
                              >
                                <option value={0}>{t('profile.mlbbAllTime')}</option>
                                {mlbbSeasons.map(s => (
                                  <option key={s} value={s}>S{s}</option>
                                ))}
                              </select>
                              <svg className={styles.mlbbSeasonChevron} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                            </div>
                          )}
                          <div className={styles.mlbbSeasonSelect}>
                            <select
                              className={styles.mlbbSeasonDropdown}
                              value={mlbbSortKey}
                              onChange={e => { setMlbbSortKey(e.target.value as typeof mlbbSortKey); setMlbbSortAsc(false); }}
                            >
                              <option value="total_games">{t('profile.mlbbSortGames')}</option>
                              <option value="win_rate">{t('profile.mlbbSortWR')}</option>
                              <option value="kda">{t('profile.mlbbSortKDA')}</option>
                              <option value="avg_kills">{t('profile.mlbbSortKills')}</option>
                              <option value="mvp">{t('profile.mlbbSortMVP')}</option>
                            </select>
                            <svg className={styles.mlbbSeasonChevron} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                          </div>
                          <button
                            className={styles.mlbbSortDirBtn}
                            onClick={() => setMlbbSortAsc(v => !v)}
                          >
                            {mlbbSortAsc ? '↑' : '↓'}
                          </button>
                        </div>

                        {/* Hero cards */}
                        <div className={styles.mlbbCardList}>
                          {sorted.slice(0, mlbbVisible).map((stat) => {
                            const hero = heroes.find((h: any) => h.hero_game_id === stat.hero_id);
                            const wrColor = stat.win_rate >= 55 ? '#22c55e' : stat.win_rate >= 50 ? '#86efac' : stat.win_rate >= 45 ? '#fbbf24' : '#ef4444';
                            const isExpanded = mlbbExpanded.has(stat.hero_id);
                            return (
                              <div key={stat.hero_id} className={`${styles.mlbbCard} ${isExpanded ? styles.mlbbCardOpen : ''}`}>

                                {/* Collapsed row — always visible */}
                                <div className={styles.mlbbCardRow} onClick={() => toggleMlbbRow(stat.hero_id)}>
                                  <div className={styles.mlbbCardHero}>
                                    {hero?.head
                                      ? <img src={hero.head} alt={hero.name} className={styles.mlbbCardImg} />
                                      : <div className={styles.mlbbCardImgPlaceholder} />}
                                    <span className={styles.mlbbCardName}>{hero?.name ?? `#${stat.hero_id}`}</span>
                                  </div>
                                  <div className={styles.mlbbCardStats}>
                                    <div className={styles.mlbbCardStat}>
                                      <span className={styles.mlbbCardStatVal}>{stat.total_games}</span>
                                      <span className={styles.mlbbCardStatLbl}>{t('profile.mlbbGames')}</span>
                                    </div>
                                    <div className={styles.mlbbCardStat}>
                                      <span className={styles.mlbbCardStatVal} style={{color: wrColor}}>{stat.win_rate}%</span>
                                      <span className={styles.mlbbCardStatLbl}>{t('profile.mlbbWinRate')}</span>
                                    </div>
                                    <div className={styles.mlbbCardStat}>
                                      <span className={styles.mlbbCardStatVal}>{stat.kda.toFixed(2)}</span>
                                      <span className={styles.mlbbCardStatLbl}>{t('profile.mlbbKDA')}</span>
                                    </div>
                                  </div>
                                  <span className={`${styles.mlbbCardChevron} ${isExpanded ? styles.mlbbCardChevronOpen : ''}`}>›</span>
                                </div>

                                {/* Expanded detail */}
                                {isExpanded && (
                                  <div className={styles.mlbbCardDetail}>

                                    {/* Avg K/D/A */}
                                    <div className={styles.mlbbCardKda}>
                                      <div className={styles.mlbbCardKdaItem}>
                                        <span className={styles.mlbbCardKdaNum} style={{color:'#86efac'}}>{stat.avg_kills}</span>
                                        <span className={styles.mlbbCardKdaLbl}>{t('profile.mlbbAvgKills')}</span>
                                      </div>
                                      <div className={styles.mlbbCardKdaSep}>/</div>
                                      <div className={styles.mlbbCardKdaItem}>
                                        <span className={styles.mlbbCardKdaNum} style={{color:'#f87171'}}>{stat.avg_deaths}</span>
                                        <span className={styles.mlbbCardKdaLbl}>{t('profile.mlbbAvgDeaths')}</span>
                                      </div>
                                      <div className={styles.mlbbCardKdaSep}>/</div>
                                      <div className={styles.mlbbCardKdaItem}>
                                        <span className={styles.mlbbCardKdaNum} style={{color:'#93c5fd'}}>{stat.avg_assists}</span>
                                        <span className={styles.mlbbCardKdaLbl}>{t('profile.mlbbAvgAssists')}</span>
                                      </div>
                                    </div>

                                    {/* Stat grid */}
                                    <div className={styles.mlbbCardGrid}>
                                      <div className={styles.mlbbCardGridItem}>
                                        <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbDamageDealt')}</span>
                                        <span className={styles.mlbbCardGridVal}>{stat.avg_damage > 0 ? (stat.avg_damage / 100).toFixed(1) + 'k' : '—'}</span>
                                        <span className={styles.mlbbCardGridSub}>{t('profile.mlbbAvgPerGame')}</span>
                                      </div>
                                      <div className={styles.mlbbCardGridItem}>
                                        <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbDamageTaken')}</span>
                                        <span className={styles.mlbbCardGridVal}>{stat.avg_taken > 0 ? (stat.avg_taken / 100).toFixed(1) + 'k' : '—'}</span>
                                        <span className={styles.mlbbCardGridSub}>{t('profile.mlbbAvgPerGame')}</span>
                                      </div>
                                      <div className={styles.mlbbCardGridItem}>
                                        <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbBestKDA')}</span>
                                        <span className={styles.mlbbCardGridVal}>{stat.max_kda.toFixed(2)}</span>
                                        <span className={styles.mlbbCardGridSub}>{t('profile.mlbbPersonalRecord')}</span>
                                      </div>
                                      <div className={styles.mlbbCardGridItem}>
                                        <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbMostKills')}</span>
                                        <span className={styles.mlbbCardGridVal}>{stat.max_kills}</span>
                                        <span className={styles.mlbbCardGridSub}>{t('profile.mlbbPersonalRecord')}</span>
                                      </div>
                                      <div className={styles.mlbbCardGridItem}>
                                        <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbMVP')}</span>
                                        <span className={styles.mlbbCardGridVal}>{stat.mvp}</span>
                                        <span className={styles.mlbbCardGridSub}>{t('profile.mlbbMVPSub')}</span>
                                      </div>
                                    </div>

                                    {/* Multikills */}
                                    {(stat.penta_kills > 0 || stat.quadra_kills > 0 || stat.triple_kills > 0) && (
                                      <div className={styles.mlbbCardMulti}>
                                        {stat.penta_kills > 0 && <span className={styles.mlbbBadgePenta}><span>{t('profile.mlbbPentaKill')}</span><span>×{stat.penta_kills}</span></span>}
                                        {stat.quadra_kills > 0 && <span className={styles.mlbbBadgePurple}><span>{t('profile.mlbbQuadraKill')}</span><span>×{stat.quadra_kills}</span></span>}
                                        {stat.triple_kills > 0 && <span className={styles.mlbbBadgeBlue}><span>{t('profile.mlbbTripleKill')}</span><span>×{stat.triple_kills}</span></span>}
                                      </div>
                                    )}
                                  </div>
                                )}

                              </div>
                            );
                          })}
                        </div>

                        {mlbbVisible < sorted.length && (
                          <button className={styles.mlbbLoadMore} onClick={() => setMlbbVisible(v => v + 10)}>
                            {t('profile.mlbbShowMore', { count: Math.min(10, sorted.length - mlbbVisible) })}
                            <span className={styles.mlbbLoadMoreCount}>{t('profile.mlbbRemaining', { count: sorted.length - mlbbVisible })}</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </>
          ) : (
            <>
              {mlbbSuccess && <div className={styles.mlbbSuccessMsg}>✓ {mlbbSuccess} {t('profile.mlbbLinkedSuccess')}</div>}
              {!showMlbbLink ? (
                <button className={styles.mlbbLinkBtn} onClick={() => { setShowMlbbLink(true); setMlbbError(''); setMlbbStep('form'); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7H13V9H17C18.65 9 20 10.35 20 12C20 13.65 18.65 15 17 15H13V17H17C19.76 17 22 14.76 22 12C22 9.24 19.76 7 17 7ZM11 15H7C5.35 15 4 13.65 4 12C4 10.35 5.35 9 7 9H11V7H7C4.24 7 2 9.24 2 12C2 14.76 4.24 17 7 17H11V15ZM8 11H16V13H8V11Z"/></svg>
                  {t('profile.mlbbLinkBtn')}
                </button>
              ) : (
                <div className={styles.mlbbForm}>
                  {mlbbStep === 'form' ? (
                    <>
                      <p className={styles.mlbbFormHint}>{t('profile.mlbbFormHintStep1')}</p>
                      <img src="/login.png" alt="Where to find User ID and Server ID" className={styles.mlbbHintImg} />
                      <div className={styles.mlbbFields}>
                        <input
                          className={styles.mlbbInput}
                          placeholder={t('profile.mlbbUserIdPlaceholder')}
                          value={mlbbRoleId}
                          onChange={e => setMlbbRoleId(e.target.value)}
                        />
                        <input
                          className={styles.mlbbInput}
                          placeholder={t('profile.mlbbServerIdPlaceholder')}
                          value={mlbbZoneId}
                          onChange={e => setMlbbZoneId(e.target.value)}
                        />
                      </div>
                      {mlbbError && <p className={styles.mlbbError}>{mlbbError}</p>}
                      <div className={styles.mlbbFormActions}>
                        <button className={styles.mlbbSubmitBtn} onClick={handleMlbbSendCode} disabled={mlbbLoading}>
                          {mlbbLoading ? '...' : t('profile.mlbbSendCode')}
                        </button>
                        <button className={styles.mlbbCancelBtn} onClick={() => setShowMlbbLink(false)}>{t('profile.mlbbCancel')}</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.mlbbFormHint}>{t('profile.mlbbFormHintStep2')}</p>
                      <input
                        className={styles.mlbbInput}
                        placeholder={t('profile.mlbbCodePlaceholder')}
                        value={mlbbVc}
                        onChange={e => setMlbbVc(e.target.value)}
                        maxLength={10}
                      />
                      {mlbbError && <p className={styles.mlbbError}>{mlbbError}</p>}
                      <div className={styles.mlbbFormActions}>
                        <button className={styles.mlbbSubmitBtn} onClick={handleMlbbVerify} disabled={mlbbLoading}>
                          {mlbbLoading ? '...' : t('profile.mlbbVerify')}
                        </button>
                        <button className={styles.mlbbCancelBtn} onClick={() => setMlbbStep('form')}>{t('profile.mlbbBack')}</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Body ── */}
      {(!isOwnProfile || profileTab === 'profile') && (
      <div className={styles.body}>

        {/* Main Hero Selector (own profile) */}
        {isOwnProfile && <MainHeroSelector />}

        {/* MLBB link promo — shown on own profile if not linked yet */}
        {isOwnProfile && !user.mlbb_role_id && !user.mlbb_nickname && (
          <div className={styles.mlbbPromo} onClick={() => setProfileTab('mlbb')}>
            <img src="/mlbb-icon.png" alt="MLBB" className={styles.mlbbPromoIcon} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className={styles.mlbbPromoText}>
              <span className={styles.mlbbPromoTitle}>{t('profile.mlbbLinkBtn')}</span>
              <span className={styles.mlbbPromoSub}>{t('profile.mlbbHeroStats')}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color:'rgba(255,255,255,0.3)',flexShrink:0}}><path d="M8 5v14l11-7z"/></svg>
          </div>
        )}

        {/* Main heroes (other profiles) */}
        {!isOwnProfile && main_heroes.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('profile.mainHeroes')}</h2>
              <span className={styles.sectionCount}>{main_heroes.length}</span>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.heroesGrid}>
                {main_heroes.map(h => (
                  <Link key={h.hero_id} to={`/${h.game_id || 2}/heroes/${heroToSlug(h.name)}`} className={styles.heroCard}>
                    <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                    <span>{h.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Builds */}
        {builds.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('profile.publicBuilds')}</h2>
              <span className={styles.sectionCount}>{builds.length}</span>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.buildsList}>
                {builds.map(b => {
                  const score = (b.upvotes || 0) - (b.downvotes || 0);
                  const buildItems = (b.items || []).map(id => itemsMap.get(id)).filter(Boolean);
                  return (
                    <div key={b.id} className={styles.buildItem}>
                      <Link to={`/2/heroes/${heroToSlug(b.hero_name)}?tab=builds`} className={styles.buildLink}>
                        {b.hero_head && <img src={b.hero_head} alt={b.hero_name} className={styles.buildHeroImg} loading="lazy" />}
                        <div className={styles.buildMeta}>
                          <span className={styles.buildName}>{b.name}</span>
                          <span className={styles.buildHeroName}>{b.hero_name}</span>
                          {b.created_at && (
                            <span className={styles.buildDate}>{new Date(b.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className={styles.buildItemIcons}>
                          {buildItems.slice(0, 6).map((item, idx) =>
                            item?.icon_url ? <img key={idx} src={item.icon_url} alt={item.name} title={item.name} loading="lazy" /> : null
                          )}
                        </div>
                      </Link>
                      <div className={`${styles.buildScore} ${score > 0 ? styles.positive : score < 0 ? styles.negative : ''}`}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
                        </svg>
                        {score}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('profile.favoriteHeroes')}</h2>
              <span className={styles.sectionCount}>{favorites.length}</span>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.heroesGrid}>
                {favorites.map(h => (
                  <Link key={h.id} to={`/${h.game_id || 2}/heroes/${heroToSlug(h.name)}`} className={styles.heroCard}>
                    <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                    <span>{h.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {builds.length === 0 && favorites.length === 0 && main_heroes.length === 0 && (
          <div className={styles.empty}>
            <svg className={styles.emptyIcon} width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <p>{t('profile.empty')}</p>
            <div className={styles.emptyActions}>
              <Link to={`/${selectedGameId}/heroes`} className={styles.emptyLink}>
                {t('profile.exploreHeroes', 'Explore Heroes')}
              </Link>
            </div>
          </div>
        )}

      </div>
      )}{/* /body */}

      {/* ── Delete account ── */}
      {isOwnProfile && (
        <div className={styles.dangerZone}>
          {!deleteConfirm ? (
            <button className={styles.deleteAccountBtn} onClick={() => setDeleteConfirm(true)}>
              {t('profile.deleteAccount')}
            </button>
          ) : (
            <div className={styles.deleteConfirm}>
              <p>{t('profile.deleteConfirmText')}</p>
              <div className={styles.deleteConfirmBtns}>
                <button className={styles.deleteConfirmYes} disabled={deleting} onClick={async () => {
                  setDeleting(true);
                  try { await authFetch('/users/account', { method: 'DELETE' }); logout(); navigate('/'); }
                  finally { setDeleting(false); }
                }}>
                  {deleting ? '...' : t('profile.deleteConfirmYes')}
                </button>
                <button className={styles.deleteConfirmNo} onClick={() => setDeleteConfirm(false)}>
                  {t('profile.deleteConfirmNo')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Banner picker modal ── */}
      {showBannerPicker && (
        <div className={styles.pickerOverlay} onClick={() => setShowBannerPicker(false)}>
          <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
            <h3>{t('profile.bannerChooseHero')}</h3>
            <input
              className={styles.pickerSearch}
              value={bannerSearch}
              onChange={e => setBannerSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
            />
            <div className={styles.pickerGrid}>
              {filteredHeroes.map((h: any) => (
                <button
                  key={h.id}
                  className={`${styles.pickerHero} ${user.banner_hero_id === h.id ? styles.active : ''}`}
                  onClick={() => saveBannerHero(h.id)}
                  disabled={saving}
                >
                  <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                  <span>{h.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );

};

export default ProfilePage;
