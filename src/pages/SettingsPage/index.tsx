import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, Theme } from '../../store/themeStore';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { getDaysOptions, getRankOptions } from '../HeroRankPage/constants';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const SystemIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.user);
  const { theme, setTheme } = useThemeStore();
  const { defaultDays, defaultRank, setDefaultDays, setDefaultRank } = useFilterSettingsStore();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    if (mq.matches) navigate('/', { replace: true });
    const handler = (e: MediaQueryListEvent) => { if (e.matches) navigate('/', { replace: true }); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [navigate]);

  const daysOptions = getDaysOptions(t);
  const rankOptions = getRankOptions(t);

  useSEO({ title: t('settings.title'), noindex: true });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const themeOptions: { value: Theme; labelKey: string; Icon: React.FC }[] = [
    { value: 'dark', labelKey: 'settings.themeDark', Icon: MoonIcon },
    { value: 'light', labelKey: 'settings.themeLight', Icon: SunIcon },
    { value: 'system', labelKey: 'settings.themeSystem', Icon: SystemIcon },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t('settings.title')}</h1>

      {/* Theme */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.theme')}</h2>
        <div className={styles.themeOptions}>
          {themeOptions.map(({ value, labelKey, Icon }) => (
            <button
              key={value}
              className={`${styles.themeBtn} ${theme === value ? styles['themeBtn--active'] : ''}`}
              onClick={() => setTheme(value)}
            >
              <span className={styles.themeBtnIcon}><Icon /></span>
              <span className={styles.themeBtnLabel}>{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.language')}</h2>
        <div className={styles.langOptions}>
          {(['en', 'uk', 'id'] as const).map((lng) => (
            <button
              key={lng}
              className={`${styles.langBtn} ${i18n.language === lng ? styles['langBtn--active'] : ''}`}
              onClick={() => changeLanguage(lng)}
            >
              {lng === 'en' ? `🇬🇧 ${t('settings.lang_en')}` : lng === 'uk' ? `🇺🇦 ${t('settings.lang_uk')}` : `🇮🇩 ${t('settings.lang_id')}`}
            </button>
          ))}
        </div>
      </section>

      {/* Filter Defaults */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.defaults')}</h2>
        <p className={styles.sectionDesc}>{t('settings.defaultsDesc')}</p>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>{t('settings.defaultDays')}</span>
          <div className={styles.filterPills}>
            {daysOptions.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.pill} ${defaultDays === opt.value ? styles['pill--active'] : ''}`}
                onClick={() => setDefaultDays(Number(opt.value))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>{t('settings.defaultRank')}</span>
          <div className={styles.filterPills}>
            {rankOptions.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.pill} ${defaultRank === opt.value ? styles['pill--active'] : ''}`}
                onClick={() => setDefaultRank(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MLBB Account */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>MLBB</h2>
        {currentUser ? (
          <Link to={`/profile/${currentUser.id}?tab=mlbb`} className={styles.mlbbRow}>
            <span>{t('profile.mlbbLinkBtn')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
          </Link>
        ) : (
          <Link to="/login" className={styles.mlbbRow}>
            <span>{t('loginToLink', 'Увійдіть щоб підключити акаунт')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
          </Link>
        )}
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.about')}</h2>
        <div className={styles.aboutBlock}>
          <p className={styles.aboutName}>{t('settings.appName')}</p>
          <p className={styles.aboutSub}>{t('settings.unofficial')}</p>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
