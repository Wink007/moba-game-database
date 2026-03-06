import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { MainHeroSelector } from '../../components/MainHeroSelector';
import { useAuthStore } from '../../store/authStore';
import { useSEO } from '../../hooks/useSEO';
import { queryKeys } from '../../queries/keys';
import { API_URL } from '../../config';
import styles from './styles.module.scss';

interface ProfileData {
  user: {
    id: number;
    name: string;
    picture: string;
    created_at: string;
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
  const numericUserId = Number(userId);
  const isOwnProfile = currentUser?.id === numericUserId;

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: queryKeys.profile.user(numericUserId),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users/${numericUserId}/profile`);
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
    enabled: !!numericUserId,
  });

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
          <h1 className={styles.userName}>{user.name}</h1>
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
              return (
                <div key={b.id} className={styles.buildItem}>
                  <div className={styles.buildHero}>
                    {b.hero_head && <img src={b.hero_head} alt={b.hero_name} loading="lazy" />}
                    <span>{b.hero_name}</span>
                  </div>
                  <div className={styles.buildInfo}>
                    <strong>{b.name}</strong>
                    <span className={`${styles.buildScore} ${score > 0 ? styles.positive : score < 0 ? styles.negative : ''}`}>
                      {score > 0 ? '+' : ''}{score}
                    </span>
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
