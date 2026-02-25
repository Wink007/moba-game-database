import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useHeroesQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { useFavorites } from '../../hooks/useFavorites';
import { useSEO } from '../../hooks/useSEO';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { HeroCard } from '../HeroesPage/components/HeroCard';
import styles from './styles.module.scss';

export const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();
  useSEO({
    title: t('favorites.pageTitle'),
    description: t('favorites.pageDescription'),
  });

  const { selectedGameId } = useGameStore();
  const user = useAuthStore((s) => s.user);
  const { favorites, isLoading: favLoading } = useFavorites();
  const { data: heroes, isLoading: heroesLoading } = useHeroesQuery(selectedGameId);

  const googleLogin = useGoogleAuth();

  // Not logged in
  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('favorites.pageTitle')}</h1>
        <div className={styles.loginPrompt}>
          <p>{t('favorites.loginRequired')}</p>
          <button className={styles.loginButton} onClick={() => googleLogin()}>
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  if (favLoading || heroesLoading) return <Loader />;

  // Cross-reference favorites with hero data
  const favoriteHeroIds = new Set(favorites.map((f) => f.hero_id));
  const favoriteHeroes = (heroes || []).filter((h) => favoriteHeroIds.has(h.id));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('favorites.pageTitle')}</h1>

      {favoriteHeroes.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('favorites.empty')}</p>
          <Link to={`/${selectedGameId}/heroes`} className={styles.browseLink}>
            {t('favorites.browseHeroes')}
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {favoriteHeroes.map((hero) => (
            <HeroCard key={hero.id} hero={hero} gameId={selectedGameId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
