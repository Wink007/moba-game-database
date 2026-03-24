import React, { useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useGameStore } from '../../store/gameStore';
import { useAdStore, selectAdsEnabled, selectAdFreeMinutesLeft } from '../../store/adStore';
import { SearchBar } from '../SearchBar';
import { SettingsPanel } from './SettingsPanel';
import { SettingsIcon } from './icons';
import { SHEET_NAV_ITEMS } from './navConfig';
import type { MobileSheetProps } from './types';
import { Capacitor } from '@capacitor/core';
import styles from './styles.module.scss';

export const MobileSheet: React.FC<MobileSheetProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  const [sheetView, setSheetView] = useState<'main' | 'settings'>('main');
  const openRemoveAdsModal = useAdStore(s => s.openRemoveAdsModal);
  const adsEnabled = useAdStore(selectAdsEnabled);
  const minutesLeft = useAdStore(selectAdFreeMinutesLeft);
  const isNative = Capacitor.isNativePlatform();

  const closeSettings = useCallback(() => setSheetView('main'), []);

  useEffect(() => {
    if (!isOpen) setSheetView('main');
  }, [isOpen]);

  useBackHandler(isOpen && sheetView === 'main', onClose);
  useBackHandler(isOpen && sheetView === 'settings', closeSettings);

  return (
    <div className={`${styles.sheet} ${isOpen ? styles['sheet--open'] : ''}`}>
      <div className={styles['sheet-handle']} />

      {sheetView === 'main' ? (
        <>
          <div className={styles['sheet-main-scroll']}>
            <div className={styles['sheet-search']}>
              <SearchBar onSelect={onClose} />
            </div>
            <div className={styles['sheet-grid']}>
              {SHEET_NAV_ITEMS.map(({ key, path, Icon, absolute }) => (
                <NavLink
                  key={key}
                  to={absolute ? path : `/${selectedGameId}/${path}`}
                  className={({ isActive }) =>
                    `${styles['sheet-item']} ${isActive ? styles['sheet-item--active'] : ''}`
                  }
                  onClick={onClose}
                >
                  <div className={styles['sheet-icon']}><Icon /></div>
                  <span className={styles['sheet-label']}>{t(`header.${key}`)}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className={styles['sheet-footer']}>
            <button className={styles['sheet-footer-settings']} onClick={() => setSheetView('settings')}>
              <SettingsIcon />
              <span>{t('header.settings')}</span>
            </button>
            {isNative && (
              <button
                className={styles['remove-ads-btn']}
                onClick={() => { openRemoveAdsModal(); onClose(); }}
                title={t('removeAds.title')}
              >
                {adsEnabled
                  ? t('removeAds.btnAds')
                  : minutesLeft
                    ? `✅ ${minutesLeft} ${t('removeAds.min')}`
                    : t('removeAds.btnNoAds')}
              </button>
            )}
          </div>
        </>
      ) : (
        <SettingsPanel onBack={closeSettings} onClose={onClose} />
      )}
    </div>
  );
};
