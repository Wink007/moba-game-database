import React, { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import styles from './styles.module.scss';

interface Props {
  onDone: () => void;
}

export const AnimatedSplash: React.FC<Props> = ({ onDone }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Приховуємо нативний splash — React-екран вже відображається
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide({ fadeOutDuration: 200 });
    }

    // Загальна тривалість анімації: 2.4s
    timerRef.current = setTimeout(() => {
      onDone();
    }, 2400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDone]);

  return (
    <div className={styles.overlay}>
      {/* Частинки */}
      <div className={styles.particles}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* Glow-кільця */}
      <div className={styles.ring1} />
      <div className={styles.ring2} />

      {/* Логотип */}
      <div className={styles.logoWrap}>
        <svg className={styles.logo} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1f36"/>
              <stop offset="100%" stopColor="#0f1729"/>
            </linearGradient>
            <linearGradient id="sp-text" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="100%" stopColor="#818cf8"/>
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#sp-bg)"/>
          <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="url(#sp-text)" strokeWidth="2" opacity="0.6"/>
          <text x="32" y="42" fontFamily="Arial, Helvetica, sans-serif" fontSize="26" fontWeight="bold" fill="url(#sp-text)" textAnchor="middle" letterSpacing="-1">MW</text>
        </svg>
        <div className={styles.logoGlow} />
      </div>

      {/* Текст */}
      <div className={styles.textWrap}>
        <h1 className={styles.appName}>MOBA Wiki</h1>
        <p className={styles.tagline}>Mobile Legends Database</p>
      </div>

      {/* Fade-out overlay */}
      <div className={styles.fadeOut} />
    </div>
  );
};
