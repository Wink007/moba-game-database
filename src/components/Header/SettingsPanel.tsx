import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, Theme } from '../../store/themeStore';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { getDaysOptions, getRankOptions } from '../../pages/HeroRankPage/constants';
import { Capacitor } from '@capacitor/core';
import type { SettingsPanelProps } from './types';
import styles from './styles.module.scss';

const localeLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import(/* webpackChunkName: "locale-en" */ '../../locales/en.json'),
  uk: () => import(/* webpackChunkName: "locale-uk" */ '../../locales/uk.json'),
  id: () => import(/* webpackChunkName: "locale-id" */ '../../locales/id.json'),
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onBack, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { defaultDays, defaultRank, setDefaultDays, setDefaultRank } = useFilterSettingsStore();
  const daysOptions = useMemo(() => getDaysOptions(t), [t]);
  const rankOptions = useMemo(() => getRankOptions(t), [t]);
  const isNative = Capacitor.isNativePlatform();

  return (
    <div className={styles['sheet-settings']}>
      <div className={styles['sheet-settings-header']}>
        <button className={styles['sheet-back-btn']} onClick={onBack} aria-label={t('common.back')}>
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
            {(['dark', 'light', 'system'] as Theme[]).map(value => (
              <button
                key={value}
                className={`${styles['settings-pill']} ${theme === value ? styles['settings-pill--active'] : ''}`}
                onClick={() => setTheme(value)}
              >
                {t(`settings.theme${value.charAt(0).toUpperCase() + value.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className={styles['settings-section']}>
          <div className={styles['settings-section-title']}>{t('settings.language')}</div>
          <div className={styles['settings-theme-row']}>
            {(['en', 'uk', 'id'] as const).map(lng => (
              <button
                key={lng}
                className={`${styles['settings-pill']} ${i18n.language === lng ? styles['settings-pill--active'] : ''}`}
                onClick={async () => {
                  if (!i18n.hasResourceBundle(lng, 'translation')) {
                    const loader = localeLoaders[lng];
                    if (loader) {
                      const { default: data } = await loader();
                      i18n.addResourceBundle(lng, 'translation', data, true, true);
                    }
                  }
                  i18n.changeLanguage(lng);
                  localStorage.setItem('language', lng);
                }}
              >
                {lng === 'en' ? `🇬🇧 ${t('settings.lang_en')}` : lng === 'uk' ? `🇺🇦 ${t('settings.lang_uk')}` : `🇮🇩 ${t('settings.lang_id')}`}
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

        {/* MLBB Account */}
        <div className={styles['settings-section']}>
          <div className={styles['settings-section-title']}>MLBB</div>
          <button
            className={styles['settings-mlbb-row']}
            onClick={() => { onClose(); navigate(user ? `/profile/${user.id}?tab=mlbb` : '/login'); }}
          >
            <span>{user ? t('profile.mlbbLinkBtn') : t('settings.loginToLink', 'Увійдіть щоб підключити акаунт')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
          </button>
        </div>

        <div className={styles['settings-divider']} />

        {isNative && (
          <a href="https://mobawiki.com" target="_blank" rel="noopener noreferrer" className={styles['settings-website-link']}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className={styles['settings-website-label']}>{t('settings.website')}</span>
            <span className={styles['settings-website-url']}>mobawiki.com</span>
            <svg className={styles['settings-website-arrow']} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};
