import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { useGamesQuery } from '../../queries/useGamesQuery';
import { useHeroQuery } from '../../queries/useHeroesQuery';
import { useItemsQuery } from '../../queries/useItemsQuery';
import { getHeroName, getItemName } from '../../utils/translation';
import styles from './styles.module.scss';

export const Breadcrumbs: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { selectedGameId } = useGameStore();
  const { data: games } = useGamesQuery();
  const { data: items } = useItemsQuery(selectedGameId);
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const heroIdFromUrl =
    pathSegments[0] === String(selectedGameId) &&
    pathSegments[1] === 'heroes' &&
    pathSegments[2]
      ? parseInt(pathSegments[2])
      : 0;
  const { data: hero } = useHeroQuery(heroIdFromUrl);

  // Build breadcrumbs before early return — hooks must not be called after conditional returns
  const currentGame = games?.find(game => game.id === selectedGameId);
  const breadcrumbs: { label: string | undefined; path: string }[] = [
    { label: currentGame?.name, path: '/' },
  ];

  if (currentGame && pathSegments.length > 0 && pathSegments[0] === String(selectedGameId)) {
    if (pathSegments[1]) {
      const section = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1);
      breadcrumbs.push({ label: section, path: `/${selectedGameId}/${pathSegments[1]}` });

      if (pathSegments[2]) {
        const itemId = parseInt(pathSegments[2]);
        let itemName = decodeURIComponent(pathSegments[2]);
        if (pathSegments[1] === 'heroes' && hero) itemName = getHeroName(hero, i18n.language);
        if (pathSegments[1] === 'items' && items) {
          const item = items.find(i => i.id === itemId);
          if (item) itemName = getItemName(item, i18n.language);
        }
        breadcrumbs.push({ label: itemName, path: location.pathname });
      }
    }
  }

  const labelsKey = breadcrumbs.map(b => b.label ?? '').join('|');

  useEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;
    const check = () => setCollapsed(measure.offsetWidth > nav.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(nav);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelsKey]);

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) return null;

  const visibleCrumbs: ({ label: string | undefined; path: string } | null)[] =
    collapsed && breadcrumbs.length >= 3
      ? [breadcrumbs[0], null, breadcrumbs[breadcrumbs.length - 1]]
      : breadcrumbs;

  return (
    <nav ref={navRef} className={styles.breadcrumbs} aria-label="Breadcrumb">
      {/* Hidden strip to measure full content width */}
      <ol ref={measureRef} className={styles['list-measure']} aria-hidden="true">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.path} className={styles.item}>
              {!isLast
                ? <><span>{crumb.label}</span><span className={styles.separator}>›</span></>
                : <span>{crumb.label}</span>
              }
            </li>
          );
        })}
      </ol>
      <ol className={styles.list}>
        {visibleCrumbs.map((crumb, index) => {
          const isLast = index === visibleCrumbs.length - 1;
          if (crumb === null) return (
            <li key="ellipsis" className={styles.item}>
              <span className={styles.ellipsis}>…</span>
              <span className={styles.separator}>›</span>
            </li>
          );
          return (
            <li key={crumb.path} className={styles.item}>
              {!isLast ? (
                <>
                  <Link to={crumb.path} className={styles.link}>{crumb.label}</Link>
                  <span className={styles.separator}>›</span>
                </>
              ) : (
                <span className={styles.current}>{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
