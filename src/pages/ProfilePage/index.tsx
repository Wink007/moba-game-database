import React, { useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { MainHeroSelector } from '../../components/MainHeroSelector';
import { useAuthStore, authFetch } from '../../store/authStore';
import { useSEO } from '../../hooks/useSEO';
import { useItemsQuery } from '../../queries/useItemsQuery';
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

  // Nickname editing
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSaving, setNicknameSaving] = useState(false);

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

  return (
    <div className={styles.container}>
      {/* Profile header */}
      <div className={styles.profileHeader}>
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
          {user.nickname && (
            <span className={styles.realName}>{user.name}</span>
          )}
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
          <div className={styles.statsRow}>
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
        </div>
      </div>

      {/* Main Hero Selector — only on own profile */}
      {isOwnProfile && <MainHeroSelector />}

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
    </div>
  );
};

export default ProfilePage;
