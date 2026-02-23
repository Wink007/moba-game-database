import React from 'react';
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

  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Determine hero ID from URL if on hero detail page
  const heroIdFromUrl =
    pathSegments[0] === String(selectedGameId) &&
    pathSegments[1] === 'heroes' &&
    pathSegments[2]
      ? parseInt(pathSegments[2])
      : 0;
  const { data: hero } = useHeroQuery(heroIdFromUrl);
  
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
          if (pathSegments[1] === 'heroes' && hero) {
            itemName = getHeroName(hero, i18n.language);
          }

          // Get item name if on item detail page
          if (pathSegments[1] === 'items' && items) {
            const item = items.find(i => i.id === itemId);
            if (item) {
              itemName = getItemName(item, i18n.language);
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
