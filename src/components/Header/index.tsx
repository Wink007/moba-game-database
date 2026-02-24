import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { SearchBar } from '../SearchBar';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { UserMenu } from '../UserMenu';
import { Breadcrumbs } from '../Breadcrumbs';

import styles from './styles.module.scss';

/* SVG icons for menu items */
const HeroesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
  </svg>
);
const ItemsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const EmblemsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const SpellsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const PatchesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const FavoritesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CounterPickIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

const NAV_ITEMS = [
  { key: 'heroes', path: 'heroes', Icon: HeroesIcon },
  { key: 'items', path: 'items', Icon: ItemsIcon },
  { key: 'emblems', path: 'emblems', Icon: EmblemsIcon },
  { key: 'spells', path: 'spells', Icon: SpellsIcon },
  { key: 'counterPick', path: 'counter-pick', Icon: CounterPickIcon },
  { key: 'patches', path: 'patches', Icon: PatchesIcon },
];

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <>
    <header className={styles.header}>
        <div className={styles['logo-wrapper']}>
          <Link 
                to={`/`}
                className={styles.logo}
                style={{backgroundImage: `url(/${selectedGameId}.png)`}}
                onClick={closeMenu}
                aria-label="MOBA Wiki — Home"
            />
        </div>

        {/* Desktop navigation */}
        <nav className={styles['desktop-nav']}>
          {NAV_ITEMS.map(({ key, path, Icon }) => (
            <NavLink
              key={key}
              to={`/${selectedGameId}/${path}`}
              className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''} ${key === 'patches' ? styles['patches-link'] : ''}`}
            >
                <Icon />
                <span>{t(`header.${key}`)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Burger button for mobile */}
        <button 
          className={`${styles.burger} ${isMenuOpen ? styles['burger--open'] : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={styles['desktop-user']}>
          <UserMenu />
        </div>

        {/* Bottom Sheet Overlay */}
        <div 
          className={`${styles.overlay} ${isMenuOpen ? styles['overlay--visible'] : ''}`} 
          onClick={closeMenu}
        />

        {/* Bottom Sheet Menu */}
        <div className={`${styles.sheet} ${isMenuOpen ? styles['sheet--open'] : ''}`}>
          <div className={styles['sheet-handle']} />

          {/* Search */}
          <div className={styles['sheet-search']}>
            <SearchBar onSelect={closeMenu} />
          </div>

          {/* Nav grid */}
          <div className={styles['sheet-grid']}>
            {NAV_ITEMS.map(({ key, path, Icon }) => (
              <NavLink
                key={key}
                to={`/${selectedGameId}/${path}`}
                className={({ isActive }) => `${styles['sheet-item']} ${isActive ? styles['sheet-item--active'] : ''}`}
                onClick={closeMenu}
              >
                <div className={styles['sheet-icon']}>
                  <Icon />
                </div>
                <span className={styles['sheet-label']}>{t(`header.${key}`)}</span>
              </NavLink>
            ))}
          </div>

          {/* Bottom row: language + user */}
          <div className={styles['sheet-footer']}>
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
    </header>

    {/* Sub-header: Breadcrumbs + Search + Language (desktop only) */}
    <div className={styles.subheader}>
      <div className={styles['subheader-inner']}>
        <div className={styles['subheader-left']}>
          <Breadcrumbs />
        </div>
        <div className={styles['subheader-right']}>
          <SearchBar />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
    </>
  );
};
