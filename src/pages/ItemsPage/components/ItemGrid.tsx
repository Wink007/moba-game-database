import React from 'react';
import { useTranslation } from 'react-i18next';
import { ItemGridProps } from './interface';
import { getItemName } from '../../../utils/translation';
import parentStyles from '../styles.module.scss';

export const ItemGrid: React.FC<ItemGridProps> = React.memo(({
  items,
  selectedItemId,
  onItemClick,
}) => {
  const { i18n } = useTranslation();
  return (
    <main className={parentStyles.mainContent}>
      <div className={parentStyles.itemsGrid}>
        {items.map(item => (
          <div
            key={item.id}
            className={`${parentStyles.itemCard} ${selectedItemId === item.id ? parentStyles.selected : ''}`}
            data-tier={item.tier}
            onClick={() => onItemClick(item)}
          >
            <div className={parentStyles.itemIcon}>
              {item.icon_url && <img src={item.icon_url} alt={item.name} />}
            </div>
            <div className={parentStyles.itemInfo}>
              <h4>{getItemName(item, i18n.language)}</h4>
              {item.price_total && (
                <div className={parentStyles.itemPrice}>
                  <span className={parentStyles.goldIcon}>💰</span>
                  {item.price_total}
                </div>
              )}
            </div>
            {item.tier && (
              <div className={`${parentStyles.itemTier} ${parentStyles[`tier${item.tier}`]}`}>
                T{item.tier}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
});
