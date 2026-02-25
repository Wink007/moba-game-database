import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useFavorites } from '../../hooks/useFavorites';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import styles from './styles.module.scss';

interface FavoriteButtonProps {
  heroId: number;
  className?: string;
  tooltipPosition?: 'top' | 'bottom';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ heroId, className, tooltipPosition = 'bottom' }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite, addFavorite, isLoading: favLoading } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const pendingHeroRef = useRef<number | null>(null);

  const active = isFavorite(heroId);

  // Google login for non-auth users — auto-adds favorite after login
  const googleLogin = useGoogleAuth(useCallback(async () => {
    if (pendingHeroRef.current !== null) {
      try { await addFavorite(pendingHeroRef.current); } catch { /* user can retry */ }
      pendingHeroRef.current = null;
    }
  }, [addFavorite]));

  const handleClick = async () => {
    if (isToggling || favLoading) return;

    // Not logged in — show tooltip then trigger Google login
    if (!user) {
      pendingHeroRef.current = heroId;
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      setTimeout(() => googleLogin(), 400);
      return;
    }

    setIsToggling(true);
    try {
      await toggleFavorite(heroId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const tooltipText = user
    ? (active ? t('favorites.remove') : t('favorites.add'))
    : t('favorites.loginToAdd');

  return (
    <div className={styles.favWrapper}>
      <button
        className={`${styles.favoriteBtn} ${active ? styles.active : ''} ${!user ? styles.notAuth : ''} ${className || ''}`}
        onClick={handleClick}
        disabled={isToggling}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      {showTooltip && (
        <div className={`${styles.loginTooltip} ${tooltipPosition === 'top' ? styles.loginTooltipTop : ''}`}>
          {t('favorites.loginToAdd')}
        </div>
      )}
    </div>
  );
};
