import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, Theme } from '../../store/themeStore';
import styles from './styles.module.scss';

const MOBILE_BREAKPOINT = 768;

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
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  // Settings is a mobile-only page — redirect desktop users to home
  useEffect(() => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

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
          {(['en', 'uk'] as const).map((lng) => (
            <button
              key={lng}
              className={`${styles.langBtn} ${i18n.language === lng ? styles['langBtn--active'] : ''}`}
              onClick={() => changeLanguage(lng)}
            >
              {lng === 'en' ? '🇬🇧 English' : '🇺🇦 Українська'}
            </button>
          ))}
        </div>
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
