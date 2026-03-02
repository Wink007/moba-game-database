import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import styles from './styles.module.scss';

const STORAGE_KEY = 'cookie_consent';
const GA_ID = 'G-WR8L7MDVQL';

const initAnalytics = () => {
  if ((window as any).gaInitialized) return;
  (window as any).gaInitialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
};

export const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setVisible(true);
    } else if (saved === 'accepted') {
      initAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    initAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <p className={styles.text}>
          {t('cookie.text')}{' '}
          <Link to="/legal" className={styles.link}>{t('cookie.learnMore')}</Link>
        </p>
        <div className={styles.buttons}>
          <button className={styles.decline} onClick={handleDecline}>
            {t('cookie.decline')}
          </button>
          <button className={styles.accept} onClick={handleAccept}>
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};
