import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { SearchBar } from '../SearchBar';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { UserMenu } from '../UserMenu';
import { Breadcrumbs } from '../Breadcrumbs';
import { ThemeToggle } from '../ThemeToggle';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { useAuthStore } from '../../store/authStore';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { getDaysOptions, getRankOptions } from '../../pages/HeroRankPage/constants';
import { LoginConsentModal } from '../LoginConsentModal';
import { DesktopNav } from './DesktopNav';
import { MobileSheet } from './MobileSheet';
import { BottomNav } from './BottomNav';
import styles from './styles.module.scss';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fabHidden, setFabHidden] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fabKey, setFabKey] = useState(0);
  const [showFabConsent, setShowFabConsent] = useState(false);
  const { user, isLoading: authLoading } = useAuthStore();
  const googleLogin = useGoogleAuth();
  const location = useLocation();
  const { defaultDays, defaultRank, setDefaultDays, setDefaultRank } = useFilterSettingsStore();
  const daysOptions = useMemo(() => getDaysOptions(t), [t]);
  const rankOptions = useMemo(() => getRankOptions(t), [t]);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(v => !v), []);

  // Set --header-total-height CSS variable so subheader sticks right below
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty('--header-total-height', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { closeMenu(); }, [location.pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      setFabHidden(true);
      setFabKey(k => k + 1);
      setShowScrollTop(window.scrollY > 250);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setFabHidden(false), 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (idleTimer) clearTimeout(idleTimer); };
  }, []);

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={styles['logo-wrapper']}>
          <Link
            to="/"
            className={styles.logo}
            style={{ backgroundImage: `url(/${selectedGameId}.png)` }}
            onClick={closeMenu}
            aria-label="MOBA Wiki — Home"
          />
        </div>

        <DesktopNav />

        <button
          className={`${styles.burger} ${isMenuOpen ? styles['burger--open'] : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={styles['desktop-user']}>
          <UserMenu />
        </div>

        <div
          className={`${styles.overlay} ${isMenuOpen ? styles['overlay--visible'] : ''}`}
          onClick={closeMenu}
        />

        <MobileSheet isOpen={isMenuOpen} onClose={closeMenu} />
      </header>

      <BottomNav isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} />

      {/* Scroll to top button (mobile only) */}
      <button
        className={`${styles['scroll-top-btn']} ${showScrollTop && !fabHidden ? styles['scroll-top-btn--visible'] : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Floating user button above bottom nav (mobile only) */}
      {showFabConsent && (
        <LoginConsentModal
          onConfirm={() => { setShowFabConsent(false); googleLogin(); }}
          onCancel={() => setShowFabConsent(false)}
        />
      )}
      <div className={`${styles['mobile-fab']} ${fabHidden ? styles['mobile-fab--hidden'] : ''}`}>
        {user ? (
          <div className={styles['fab-avatar-wrap']}>
            <UserMenu key={fabKey} />
          </div>
        ) : (
          <button
            className={styles['fab-login-btn']}
            onClick={() => setShowFabConsent(true)}
            disabled={authLoading}
            aria-label="Sign in"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}
      </div>

      {/* Sub-header: Breadcrumbs + Search + Language (desktop only) */}
      <div className={styles.subheader}>
        <div className={styles['subheader-inner']}>
          <div className={styles['subheader-left']}>
            <Breadcrumbs />
          </div>
          <div className={styles['subheader-right']}>
            <SearchBar />
            <select
              className={styles['filter-select']}
              value={defaultDays}
              onChange={e => setDefaultDays(Number(e.target.value))}
              title={t('settings.defaultDays')}
            >
              {daysOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className={styles['filter-select']}
              value={defaultRank}
              onChange={e => setDefaultRank(e.target.value)}
              title={t('settings.defaultRank')}
            >
              {rankOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};
