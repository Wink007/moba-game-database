import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useGamesQuery } from '../../queries/useGamesQuery';
import { useHeroesQuery } from '../../queries/useHeroesQuery';
import { useItemsQuery } from '../../queries/useItemsQuery';
import styles from './styles.module.scss';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { selectedGameId } = useGameStore();
  const { data: games } = useGamesQuery();
  const { data: heroes } = useHeroesQuery(selectedGameId);
  const { data: items } = useItemsQuery(selectedGameId);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) {
    return null;
  }

  const currentGame = games?.find(game => game.id === selectedGameId);

  const breadcrumbs = [
    {
        label: currentGame && currentGame.name,
        path: `/`,
    }
  ];

  if (currentGame && pathSegments.length > 0) {
    // Add game if we're on a game-specific page
    if (pathSegments[0] === String(selectedGameId)) {

      // Add section (heroes, items, etc.)
      if (pathSegments[1]) {
        const section = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1);
        breadcrumbs.push({
          label: section,
          path: `/${selectedGameId}/${pathSegments[1]}`
        });

        // Add specific item (hero name, item name, etc.)
        if (pathSegments[2]) {
          const itemId = parseInt(pathSegments[2]);
          let itemName = decodeURIComponent(pathSegments[2]);

          // Get hero name if on hero detail page
          if (pathSegments[1] === 'heroes' && heroes) {
            const hero = heroes.find(h => h.id === itemId);
            if (hero) {
              itemName = hero.name;
            }
          }

          // Get item name if on item detail page
          if (pathSegments[1] === 'items' && items) {
            const item = items.find(i => i.id === itemId);
            if (item) {
              itemName = item.name;
            }
          }

          breadcrumbs.push({
            label: itemName,
            path: location.pathname
          });
        }
      }
    }
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} className={styles.item}>
              {!isLast ? (
                <>
                  <Link to={crumb.path} className={styles.link}>
                    {crumb.label}
                  </Link>
                  <span className={styles.separator}> | </span>
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
