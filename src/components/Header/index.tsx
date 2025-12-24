import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { SearchBar } from '../SearchBar';

import styles from './styles.module.scss';

export const Header: React.FC = () => {
  const { selectedGameId } = useGameStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
        <div className={styles['logo-wrapper']}>
          <Link 
                to={`/`}
                className={styles.logo}
                style={{backgroundImage: `url(/${selectedGameId}.png)`}}
                onClick={closeMenu}
            />
        </div>

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

        {/* Navigation */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles['nav--open'] : ''}`}>
            {/* Mobile Search */}
            <div className={styles['mobile-search']}>
              <SearchBar />
            </div>

            <NavLink 
                to={`/${selectedGameId}/heroes`}
                className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
            >
                Heroes
            </NavLink>
            <NavLink 
                to={`/${selectedGameId}/items`}
                className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
            >
                Items
            </NavLink>
            <NavLink 
                to={`/${selectedGameId}/emblems`}
                className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
            >
                Emblems
            </NavLink>
            <NavLink 
                to={`/${selectedGameId}/spells`}
                className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
            >
                Spells
            </NavLink>
            <NavLink 
                to={`/${selectedGameId}/patches`}
                className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
            >
                Patches
            </NavLink>
        </nav>

        {/* Search Bar for Desktop */}
        <div className={styles['search-wrapper']}>
          <SearchBar />
        </div>

        {/* Overlay for mobile */}
        {isMenuOpen && (
          <div 
            className={styles.overlay} 
            onClick={closeMenu}
          />
        )}
    </header>
  );
};
