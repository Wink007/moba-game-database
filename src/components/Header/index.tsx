import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { SearchBar } from '../SearchBar';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { UserMenu } from '../UserMenu';
import { Breadcrumbs } from '../Breadcrumbs';
import { useAdStore, selectAdsEnabled, selectAdFreeMinutesLeft } from '../../store/adStore';
import { ThemeToggle } from '../ThemeToggle';
import { getDaysOptions, getRankOptions } from '../../pages/HeroRankPage/constants';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { useAuthStore } from '../../store/authStore';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { FF_SOCIAL, FF_PLAYERS } from '../../config';
import { LoginConsentModal } from '../LoginConsentModal';
import { useThemeStore, Theme } from '../../store/themeStore';

import { Capacitor } from '@capacitor/core';

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
const TierListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const RankingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8"/><path d="M12 21V11"/><path d="M17 7l-5-5-5 5"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const PlayersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const NAV_ITEMS: { key: string; path: string; Icon: React.FC; mobileOnly?: boolean; absolute?: boolean; socialOnly?: boolean; playersOnly?: boolean }[] = [
  { key: 'heroes', path: 'heroes', Icon: HeroesIcon },
  { key: 'items', path: 'items', Icon: ItemsIcon },
  { key: 'emblems', path: 'emblems', Icon: EmblemsIcon },
  { key: 'spells', path: 'spells', Icon: SpellsIcon },
  { key: 'tierList', path: 'tier-list', Icon: TierListIcon },
  { key: 'heroRank', path: 'hero-ranks', Icon: RankingsIcon },
  { key: 'counterPick', path: 'counter-pick', Icon: CounterPickIcon },
  { key: 'patches', path: 'patches', Icon: PatchesIcon },
  { key: 'favorites', path: 'favorites', Icon: FavoritesIcon, mobileOnly: true },
  { key: 'players', path: '/players', Icon: PlayersIcon, absolute: true, playersOnly: true },
];

const DESKTOP_NAV = NAV_ITEMS.filter(i => !i.mobileOnly && (!i.socialOnly || FF_SOCIAL) && (!i.playersOnly || FF_PLAYERS));
const MORE_BTN_W = 52; // reserved width (px) for the "..." button

// Mobile bottom tab bar — always-visible primary tabs
const BOTTOM_NAV_MAIN = [
  { key: 'heroes', path: 'heroes', Icon: HeroesIcon },
  { key: 'items', path: 'items', Icon: ItemsIcon },
  { key: 'counterPick', path: 'counter-pick', Icon: CounterPickIcon },
];

const BOTTOM_NAV_KEYS = new Set(BOTTOM_NAV_MAIN.map(i => i.key));
const SHEET_NAV_ITEMS = NAV_ITEMS.filter(i => !BOTTOM_NAV_KEYS.has(i.key) && (!i.socialOnly || FF_SOCIAL) && (!i.playersOnly || FF_PLAYERS));

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { selectedGameId } = useGameStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sheetView, setSheetView] = useState<'main' | 'settings'>('main');
  const [overflowStart, setOverflowStart] = useState(DESKTOP_NAV.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabHidden, setFabHidden] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fabKey, setFabKey] = useState(0);
  const [showFabConsent, setShowFabConsent] = useState(false);
  const { user, isLoading: authLoading } = useAuthStore();
  const googleLogin = useGoogleAuth();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const openRemoveAdsModal = useAdStore(s => s.openRemoveAdsModal);
  const adsEnabled = useAdStore(selectAdsEnabled);
  const minutesLeft = useAdStore(selectAdFreeMinutesLeft);
  const isNative = Capacitor.isNativePlatform();
  const { defaultDays, defaultRank, setDefaultDays, setDefaultRank } = useFilterSettingsStore();
  const daysOptions = useMemo(() => getDaysOptions(t), [t]);
  const rankOptions = useMemo(() => getRankOptions(t), [t]);

  // Refs for measuring nav items and nav container
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Set --header-total-height CSS variable so subheader sticks right below
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--header-total-height', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const closeSettings = useCallback(() => setSheetView('main'), []);
  const closeMenu = useCallback(() => { setIsMenuOpen(false); setSheetView('main'); }, []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  useBackHandler(isMenuOpen && sheetView === 'main', closeMenu);
  useBackHandler(isMenuOpen && sheetView === 'settings', closeSettings);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  // Close overflow dropdown on route change
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Dynamic overflow: measure items in hidden strip, calc cutoff on resize
  const recalcOverflow = useCallback(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;
    const navW = nav.offsetWidth;
    // Guard: skip if layout hasn't resolved yet
    if (navW < 50) return;
    const items = Array.from(measure.children) as HTMLElement[];
    if (items.length === 0 || (items[0] as HTMLElement).offsetWidth === 0) return;

    // First pass: check if ALL items fit without a "..." button
    let totalW = 0;
    for (let i = 0; i < items.length; i++) {
      totalW += items[i].offsetWidth + (i > 0 ? 4 : 0);
    }
    if (totalW <= navW) {
      setOverflowStart(DESKTOP_NAV.length);
      return;
    }

    // Second pass: find cutoff, reserving space for the "..." button
    let used = 0;
    let cut = 0;
    for (let i = 0; i < items.length; i++) {
      const itemW = items[i].offsetWidth + (i > 0 ? 4 : 0);
      if (used + itemW + MORE_BTN_W > navW) {
        cut = i;
        break;
      }
      used += itemW;
      cut = i + 1;
    }
    setOverflowStart(cut);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(recalcOverflow);
    ro.observe(nav);
    // Double rAF: ensures CSS + layout are fully applied before first measurement
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(recalcOverflow);
    });
    return () => { ro.disconnect(); cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [recalcOverflow]);

  // Close "..." dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  // Hide FAB while scrolling, show when stopped; show scroll-to-top when scrolled down
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
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return (
    <>
    <header ref={headerRef} className={styles.header}>
        <div className={styles['logo-wrapper']}>
          <Link 
                to={`/`}
                className={styles.logo}
                style={{backgroundImage: `url(/${selectedGameId}.png)`}}
                onClick={closeMenu}
                aria-label="MOBA Wiki — Home"
            />
        </div>

        {/* Hidden measurement strip — always renders all items to measure natural widths */}
        <div ref={measureRef} className={styles['nav-measure']} aria-hidden="true">
          {DESKTOP_NAV.map(({ key, path, Icon, absolute }) => (
            <NavLink key={key} to={absolute ? path : `/${selectedGameId}/${path}`} className={styles['nav-links']} tabIndex={-1}>
              <Icon /><span>{t(`header.${key}`)}</span>
            </NavLink>
          ))}
        </div>

        {/* Desktop navigation */}
        <nav ref={navRef} className={styles['desktop-nav']}>
          {DESKTOP_NAV.slice(0, overflowStart).map(({ key, path, Icon, absolute }) => (
            <NavLink
              key={key}
              to={absolute ? path : `/${selectedGameId}/${path}`}
              className={({ isActive }) => `${styles['nav-links']} ${isActive ? styles.active : ''} ${key === 'patches' ? styles['patches-link'] : ''}`}
            >
              <Icon />
              <span>{t(`header.${key}`)}</span>
            </NavLink>
          ))}

          {/* "..." overflow button */}
          {overflowStart < DESKTOP_NAV.length && (
            <div ref={moreRef} className={styles['nav-more']}>
              <button
                className={`${styles['nav-more-btn']} ${moreOpen ? styles['nav-more-btn--open'] : ''}`}
                onClick={() => setMoreOpen(o => !o)}
                aria-label="More navigation items"
              >
                <span>•••</span>
              </button>
              {moreOpen && (
                <div className={styles['nav-more-dropdown']}>
                  {DESKTOP_NAV.slice(overflowStart).map(({ key, path, Icon, absolute }) => (
                    <NavLink
                      key={key}
                      to={absolute ? path : `/${selectedGameId}/${path}`}
                      className={({ isActive }) => `${styles['nav-more-item']} ${isActive ? styles['nav-more-item--active'] : ''}`}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Icon />
                      <span>{t(`header.${key}`)}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
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

          {sheetView === 'main' ? (
            <>
              <div className={styles['sheet-main-scroll']}>
                {/* Search */}
                <div className={styles['sheet-search']}>
                  <SearchBar onSelect={closeMenu} />
                </div>

                {/* Nav grid */}
                <div className={styles['sheet-grid']}>
                  {SHEET_NAV_ITEMS.map(({ key, path, Icon, absolute }) => (
                    <NavLink
                      key={key}
                      to={absolute ? path : `/${selectedGameId}/${path}`}
                      className={({ isActive }) => `${styles['sheet-item']} ${isActive ? styles['sheet-item--active'] : ''}`}
                      onClick={closeMenu}
                    >
                      <div className={styles['sheet-icon']}><Icon /></div>
                      <span className={styles['sheet-label']}>{t(`header.${key}`)}</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Bottom row: settings + user + remove ads */}
              <div className={styles['sheet-footer']}>
                <button className={styles['sheet-footer-settings']} onClick={() => setSheetView('settings')}>
                  <SettingsIcon />
                  <span>{t('header.settings')}</span>
                </button>
                {isNative && (
                  <button
                    className={styles['remove-ads-btn']}
                    onClick={() => { openRemoveAdsModal(); closeMenu(); }}
                    title="Прибрати рекламу"
                  >
                    {adsEnabled ? '🚫 Реклама' : minutesLeft ? `✅ ${minutesLeft} хв` : '✅ Без реклами'}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Settings panel */
            <div className={styles['sheet-settings']}>
              <div className={styles['sheet-settings-header']}>
                <button className={styles['sheet-back-btn']} onClick={closeSettings} aria-label={t('common.back')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className={styles['sheet-settings-title']}>{t('settings.title')}</span>
              </div>
              <div className={styles['sheet-settings-body']}>
                {/* Theme */}
                <div className={styles['settings-section']}>
                  <div className={styles['settings-section-title']}>{t('settings.theme')}</div>
                  <div className={styles['settings-theme-row']}>
                    {([
                      { value: 'dark' as Theme, label: t('settings.themeDark') },
                      { value: 'light' as Theme, label: t('settings.themeLight') },
                      { value: 'system' as Theme, label: t('settings.themeSystem') },
                    ]).map(({ value, label }) => (
                      <button
                        key={value}
                        className={`${styles['settings-pill']} ${theme === value ? styles['settings-pill--active'] : ''}`}
                        onClick={() => setTheme(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className={styles['settings-section']}>
                  <div className={styles['settings-section-title']}>{t('settings.language')}</div>
                  <div className={styles['settings-theme-row']}>
                    {(['en', 'uk'] as const).map((lng) => (
                      <button
                        key={lng}
                        className={`${styles['settings-pill']} ${i18n.language === lng ? styles['settings-pill--active'] : ''}`}
                        onClick={() => { i18n.changeLanguage(lng); localStorage.setItem('language', lng); }}
                      >
                        {lng === 'en' ? '🇬🇧 English' : '🇺🇦 Українська'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Defaults */}
                <div className={styles['settings-divider']} />
                <div className={styles['settings-section']}>
                  <div className={styles['settings-section-title']}>{t('settings.defaults')}</div>
                  <div className={styles['settings-section-desc']}>{t('settings.defaultsDesc')}</div>
                </div>
                <div className={styles['settings-section']}>
                  <div className={styles['settings-section-title']}>{t('settings.defaultDays')}</div>
                  <div className={styles['settings-theme-row']}>
                    {daysOptions.map(opt => (
                      <button
                        key={opt.value}
                        className={`${styles['settings-pill']} ${defaultDays === opt.value ? styles['settings-pill--active'] : ''}`}
                        onClick={() => setDefaultDays(Number(opt.value))}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles['settings-section']}>
                  <div className={styles['settings-section-title']}>{t('settings.defaultRank')}</div>
                  <div className={styles['settings-theme-row']}>
                    {rankOptions.map(opt => (
                      <button
                        key={opt.value}
                        className={`${styles['settings-pill']} ${defaultRank === opt.value ? styles['settings-pill--active'] : ''}`}
                        onClick={() => setDefaultRank(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles['settings-divider']} />
                <a
                  href="https://mobawiki.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['settings-website-link']}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span className={styles['settings-website-label']}>{t('settings.website')}</span>
                  <span className={styles['settings-website-url']}>mobawiki.com</span>
                  <svg className={styles['settings-website-arrow']} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
    </header>

    {/* Mobile Bottom Navigation Bar */}
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
        onClick={toggleMenu}
        aria-label="More"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
        <span>{t('common.more')}</span>
      </button>
    </nav>

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
            {daysOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            className={styles['filter-select']}
            value={defaultRank}
            onChange={e => setDefaultRank(e.target.value)}
            title={t('settings.defaultRank')}
          >
            {rankOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
    </>
  );
};
