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
import type { ProfileData } from './types';
import { ACTIVITY_LEVELS, LEVEL_THRESHOLDS } from './constants';
import { FollowsModal } from './components/FollowsModal';
import { BannerPickerModal } from './components/BannerPickerModal';
import { ActivityLevel } from './components/ActivityLevel';
import { MlbbSection } from './components/MlbbSection';
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
  const levelIdx = Math.min(LEVEL_THRESHOLDS.reduce((best, thr, i) => score >= thr ? i : best, 0), ACTIVITY_LEVELS.length - 1);
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : '';
  const bannerImg = user.banner_painting || user.banner_image;

  return (
    <div className={styles.container}>

      {/* ── Banner ── */}
      {bannerImg ? (
        <div className={styles.banner}>
          <img src={bannerImg} alt={user.banner_hero_name || ''} className={styles.bannerImg} loading="lazy" decoding="async" />
          <div className={styles.bannerOverlay} />
          {isOwnProfile && (
            <button className={styles.bannerEditBtn} onClick={() => setShowBannerPicker(true)}>
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
        <button className={`${styles.stat} ${styles.statBtn}`} onClick={() => setFollowsModal('followers')}>
          <span className={styles.statValue}>{followersCount}</span>
          <span className={styles.statLabel}>{t('profile.followers')}</span>
        </button>
        <button className={`${styles.stat} ${styles.statBtn}`} onClick={() => setFollowsModal('following')}>
          <span className={styles.statValue}>{profile.following_count ?? 0}</span>
          <span className={styles.statLabel}>{t('profile.following')}</span>
        </button>
      </div>

      {/* ── Follows Modal ── */}
      {followsModal && (
        <FollowsModal
          userId={numericUserId}
          type={followsModal}
          onClose={closeFollowsModal}
        />
      )}

      {/* ── Activity Level ── */}
      {score > 0 && <ActivityLevel score={score} />}

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
              <button className={styles.customizeActionBtn} onClick={() => setShowBannerPicker(true)}>
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
        <MlbbSection
          user={user}
          heroes={heroes}
          userId={numericUserId}
          onProfileRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) })}
        />
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
                  catch { setDeleteConfirm(false); }
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
