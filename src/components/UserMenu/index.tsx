import React, { useState, useRef, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../config';
import styles from './styles.module.scss';

export const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, setAuth, logout, isLoading, setLoading } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      try {
        // Exchange access token for id_token via Google's userinfo
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        });
        const userInfo = await userInfoRes.json();
        
        // Use access_token flow: send user info to our backend
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            credential: response.access_token,
            user_info: userInfo
          }),
        });
        
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        setAuth(data.user, data.token);
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
    }
  });

  if (!user) {
    return (
      <button 
        className={styles.loginBtn}
        onClick={() => googleLogin()}
        disabled={isLoading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isLoading ? '...' : t('auth.login')}
      </button>
    );
  }

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button className={styles.avatar} onClick={() => setIsOpen(!isOpen)}>
        <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
          <div className={styles.divider} />
          <button className={styles.menuItem} onClick={() => { logout(); setIsOpen(false); }}>
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
};
