import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useFavorites } from '../../hooks/useFavorites';
import styles from './styles.module.scss';

interface FavoriteButtonProps {
  heroId: number;
  className?: string;
  tooltipPosition?: 'top' | 'bottom';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ heroId, className, tooltipPosition = 'bottom' }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite, isLoading: favLoading } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const active = isFavorite(heroId);

  useEffect(() => {
    if (!showTooltip || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const TOOLTIP_W = 160;
    let left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    // clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_W - 8));
    if (tooltipPosition === 'top') {
      setTooltipStyle({ top: rect.top - 6, transform: 'translateY(-100%)', left });
    } else {
      setTooltipStyle({ top: rect.bottom + 6, left });
    }
  }, [showTooltip, tooltipPosition]);

  const handleClick = async () => {
    if (isToggling || favLoading) return;

    // Not logged in — show tooltip only
    if (!user) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
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
        ref={btnRef}
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
      {showTooltip && ReactDOM.createPortal(
        <div className={styles.loginTooltip} style={{ ...tooltipStyle, position: 'fixed', width: 160 }}>
          {t('favorites.loginToAdd')}
        </div>,
        document.body
      )}
    </div>
  );
};
