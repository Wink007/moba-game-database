import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { BOTTOM_NAV_MAIN } from './navConfig';
import type { BottomNavProps } from './types';
import styles from './styles.module.scss';

export const BottomNav: React.FC<BottomNavProps> = ({ isMenuOpen, onToggleMenu }) => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();

  return (
    <nav className={styles['bottom-nav']}>
      {BOTTOM_NAV_MAIN.map(({ key, path, Icon }) => (
        <NavLink
          key={key}
          to={`/${selectedGameId}/${path}`}
          className={({ isActive }) =>
            `${styles['bottom-nav-item']} ${isActive ? styles['bottom-nav-item--active'] : ''}`
          }
        >
          <Icon />
          <span>{t(`header.${key}`)}</span>
        </NavLink>
      ))}
      <button
        className={`${styles['bottom-nav-item']} ${isMenuOpen ? styles['bottom-nav-item--active'] : ''}`}
        onClick={onToggleMenu}
        aria-label="More"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
        <span>{t('common.more')}</span>
      </button>
    </nav>
  );
};
