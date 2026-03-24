import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { DESKTOP_NAV } from './navConfig';
import { useNavOverflow } from './hooks/useNavOverflow';
import styles from './styles.module.scss';

export const DesktopNav: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  const { navRef, measureRef, moreRef, overflowStart, moreOpen, setMoreOpen } = useNavOverflow();
  const location = useLocation();

  useEffect(() => { setMoreOpen(false); }, [location.pathname, setMoreOpen]);

  return (
    <>
      {/* Hidden measurement strip — always renders all items to measure natural widths */}
      <div ref={measureRef} className={styles['nav-measure']} aria-hidden="true">
        {DESKTOP_NAV.map(({ key, path, Icon, absolute }) => (
          <NavLink key={key} to={absolute ? path : `/${selectedGameId}/${path}`} className={styles['nav-links']} tabIndex={-1}>
            <Icon /><span>{t(`header.${key}`)}</span>
          </NavLink>
        ))}
      </div>

      {/* Visible desktop navigation */}
      <nav ref={navRef} className={styles['desktop-nav']}>
        {DESKTOP_NAV.slice(0, overflowStart).map(({ key, path, Icon, absolute }) => (
          <NavLink
            key={key}
            to={absolute ? path : `/${selectedGameId}/${path}`}
            className={({ isActive }) =>
              `${styles['nav-links']} ${isActive ? styles.active : ''} ${key === 'patches' ? styles['patches-link'] : ''}`
            }
          >
            <Icon />
            <span>{t(`header.${key}`)}</span>
          </NavLink>
        ))}

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
                    className={({ isActive }) =>
                      `${styles['nav-more-item']} ${isActive ? styles['nav-more-item--active'] : ''}`
                    }
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
    </>
  );
};
