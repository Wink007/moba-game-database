import React, { useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { MainHeroSelector } from '../../components/MainHeroSelector';
import { useAuthStore, authFetch } from '../../store/authStore';
import { useSEO } from '../../hooks/useSEO';
import { useItemsQuery } from '../../queries/useItemsQuery';
import { useHeroesQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { queryKeys } from '../../queries/keys';
import { API_URL } from '../../config';
import type { Item } from '../../types';
import styles from './styles.module.scss';

const ACCENT_COLORS: { key: string; label: string; color: string }[] = [
  { key: 'fighter', label: 'Fighter', color: '#f59e0b' },
  { key: 'mage', label: 'Mage', color: '#6366f1' },
  { key: 'tank', label: 'Tank', color: '#3b82f6' },
  { key: 'assassin', label: 'Assassin', color: '#ef4444' },
  { key: 'marksman', label: 'Marksman', color: '#f97316' },
  { key: 'support', label: 'Support', color: '#22c55e' },
];

function getAccentVar(accentColor?: string | null): string | undefined {
  if (!accentColor) return undefined;
  const found = ACCENT_COLORS.find(c => c.key === accentColor);
  return found?.color;
}

interface ProfileData {
  user: {
    id: number;
    name: string;
    picture: string;
    created_at: string;
    nickname?: string | null;
    banner_hero_id?: number | null;
    accent_color?: string | null;
    banner_image?: string | null;
    banner_painting?: string | null;
    banner_hero_name?: string | null;
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
}

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
        setAuth({ ...currentUser, banner_hero_id: res.banner_hero_id, accent_color: res.accent_color }, token);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
      setShowBannerPicker(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }, [currentUser, token, setAuth, queryClient, numericUserId]);

  const saveAccentColor = useCallback(async (color: string | null) => {
    setSaving(true);
    try {
      const res = await authFetch('/users/profile-settings', {
        method: 'PUT',
        body: JSON.stringify({ accent_color: color }),
      });
      if (currentUser && token) {
        setAuth({ ...currentUser, banner_hero_id: res.banner_hero_id, accent_color: res.accent_color }, token);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(numericUserId) });
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
  });

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

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : '';

  const bannerImg = user.banner_painting || user.banner_image;
  const accentStyle = getAccentVar(user.accent_color)
    ? { '--pa': getAccentVar(user.accent_color) } as React.CSSProperties
    : undefined;

  const filteredHeroes = bannerSearch
    ? heroes.filter((h: any) => h.name.toLowerCase().includes(bannerSearch.toLowerCase()))
    : heroes;

  return (
    <div className={styles.container} style={accentStyle}>
      {/* Hero Banner */}
      {bannerImg && (
        <div className={styles.banner}>
          <img src={bannerImg} alt={user.banner_hero_name || ''} className={styles.bannerImg} />
          <div className={styles.bannerOverlay} />
          {isOwnProfile && (
            <button className={styles.bannerEditBtn} onClick={() => { setBannerSearch(''); setShowBannerPicker(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
              {t('profile.bannerChange')}
            </button>
          )}
        </div>
      )}

      {/* Profile header */}
      <div className={`${styles.profileHeader} ${bannerImg ? styles.withBanner : ''}`}>
        <div className={styles.avatarSection}>
          <img src={user.picture} alt={user.name} className={styles.avatar} referrerPolicy="no-referrer" />
          {main_heroes.length > 0 && (
            <div className={styles.mainBadges}>
              {main_heroes.map(h => (
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
              <button className={styles.nicknameEditBtn} onClick={startEditNickname} title={t('profile.nicknameEdit')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.33a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/></svg>
              </button>
            )}
          </div>
          <div className={styles.subtitleRow}>
            {user.nickname && (
              <span className={styles.realName}>{user.name}</span>
            )}
            {profile.activity_title && (
              <span className={styles.activityTitle} title={`Score: ${profile.activity_score || 0}`}>
                {t(`profile.${profile.activity_title}`)}
              </span>
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
          {memberSince && (
            <span className={styles.memberSince}>
              {t('profile.memberSince', { date: memberSince })}
            </span>
          )}
        </div>
      </div>

      {/* Stats bar — separate from header */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{builds.length}</span>
          <span className={styles.statLabel}>{t('profile.builds')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{favorites_count}</span>
          <span className={styles.statLabel}>{t('profile.favorites')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{main_heroes.length}</span>
          <span className={styles.statLabel}>{t('profile.mains')}</span>
        </div>
      </div>

      {/* Main Hero Selector — only on own profile */}
      {isOwnProfile && <MainHeroSelector />}

      {/* Customize button — own profile */}
      {isOwnProfile && (
        <button className={styles.customizeBtn} onClick={() => setShowCustomize(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM21.32 9.55l-1.16-.54a7.06 7.06 0 00-.54-1.3l.42-1.2a.5.5 0 00-.12-.52l-1.42-1.42a.5.5 0 00-.52-.12l-1.2.42a7.06 7.06 0 00-1.3-.54l-.54-1.16A.5.5 0 0014.5 3h-2a.5.5 0 00-.44.27l-.54 1.16c-.46.13-.89.31-1.3.54l-1.2-.42a.5.5 0 00-.52.12L7.08 6.09a.5.5 0 00-.12.52l.42 1.2c-.23.41-.41.84-.54 1.3l-1.16.54A.5.5 0 005.5 10v2a.5.5 0 00.18.44l1.16.54c.13.46.31.89.54 1.3l-.42 1.2a.5.5 0 00.12.52l1.42 1.42a.5.5 0 00.52.12l1.2-.42c.41.23.84.41 1.3.54l.54 1.16a.5.5 0 00.44.18h2a.5.5 0 00.44-.27l.54-1.16c.46-.13.89-.31 1.3-.54l1.2.42a.5.5 0 00.52-.12l1.42-1.42a.5.5 0 00.12-.52l-.42-1.2c.23-.41.41-.84.54-1.3l1.16-.54A.5.5 0 0018.5 13v-2a.5.5 0 00-.18-.45z"/></svg>
          {t('profile.customize')}
        </button>
      )}

      {/* Customize panel */}
      {isOwnProfile && showCustomize && (
        <div className={styles.customizePanel}>
          {/* Banner selection */}
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

          {/* Accent color */}
          <div className={styles.customizeRow}>
            <span className={styles.customizeLabel}>{t('profile.accentColor')}</span>
            <div className={styles.colorSwatches}>
              <button
                className={`${styles.colorSwatch} ${styles.colorDefault} ${!user.accent_color ? styles.active : ''}`}
                onClick={() => saveAccentColor(null)}
                title={t('profile.accentColorDefault')}
                disabled={saving}
              />
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.key}
                  className={`${styles.colorSwatch} ${user.accent_color === c.key ? styles.active : ''}`}
                  style={{ background: c.color }}
                  onClick={() => saveAccentColor(c.key)}
                  title={c.label}
                  disabled={saving}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banner hero picker modal */}
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

      {/* Main Heroes — on other profiles */}
      {!isOwnProfile && main_heroes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('profile.mainHeroes')}</h2>
          <div className={styles.heroesRow}>
            {main_heroes.map(h => (
              <Link key={h.hero_id} to={`/${h.game_id || 2}/heroes/${h.hero_id}`} className={styles.heroCard}>
                <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                <span>{h.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Builds */}
      {builds.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('profile.publicBuilds')}</h2>
          <div className={styles.buildsList}>
            {builds.map(b => {
              const score = (b.upvotes || 0) - (b.downvotes || 0);
              const buildItems = (b.items || []).map(id => itemsMap.get(id)).filter(Boolean);
              return (
                <div key={b.id} className={styles.buildItem}>
                  <Link to={`/2/heroes/${b.hero_id}`} className={styles.buildLink}>
                    <div className={styles.buildHero}>
                      {b.hero_head && <img src={b.hero_head} alt={b.hero_name} loading="lazy" />}
                      <span>{b.hero_name}</span>
                    </div>
                    <div className={styles.buildInfo}>
                      <strong>{b.name}</strong>
                    </div>
                    <div className={styles.buildItemIcons}>
                      {buildItems.map((item, idx) => (
                        item?.icon_url ? (
                          <img key={idx} src={item.icon_url} alt={item.name} title={item.name} loading="lazy" />
                        ) : null
                      ))}
                    </div>
                  </Link>
                  <div className={`${styles.buildScore} ${score > 0 ? styles.positive : score < 0 ? styles.negative : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
                      <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
                    </svg>
                    <span>{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('profile.favoriteHeroes')}</h2>
          <div className={styles.heroesRow}>
            {favorites.map(h => (
              <Link key={h.id} to={`/${h.game_id || 2}/heroes/${h.id}`} className={styles.heroCard}>
                <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                <span>{h.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {builds.length === 0 && favorites.length === 0 && main_heroes.length === 0 && (
        <div className={styles.empty}>
          <p>{t('profile.empty')}</p>
        </div>
      )}

      {/* Delete account */}
      {isOwnProfile && (
        <div className={styles.dangerZone}>
          {!deleteConfirm ? (
            <button className={styles.deleteAccountBtn} onClick={() => setDeleteConfirm(true)}>
              {t('profile.deleteAccount', 'Видалити акаунт')}
            </button>
          ) : (
            <div className={styles.deleteConfirm}>
              <p>{t('profile.deleteConfirmText', 'Всі ваші дані буде видалено назавжди. Продовжити?')}</p>
              <div className={styles.deleteConfirmBtns}>
                <button
                  className={styles.deleteConfirmYes}
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const res = await authFetch(`${API_URL}/users/account`, { method: 'DELETE' });
                      if (res.ok) {
                        logout();
                        navigate('/');
                      }
                    } finally {
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? '...' : t('profile.deleteConfirmYes', 'Так, видалити')}
                </button>
                <button className={styles.deleteConfirmNo} onClick={() => setDeleteConfirm(false)}>
                  {t('profile.deleteConfirmNo', 'Скасувати')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
