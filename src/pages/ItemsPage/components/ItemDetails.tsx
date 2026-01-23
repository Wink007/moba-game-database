import React from 'react';
import { useTranslation } from 'react-i18next';
import { Item } from '../../../types';
import { ItemDetailsProps } from './interface';
import parentStyles from '../styles.module.scss';

export const ItemDetails: React.FC<ItemDetailsProps> = ({
  selectedItem,
  craftingComponents,
  usedInItems,
  isOpen,
  onClose,
  onItemClick,
  getCraftingTree,
}) => {
  const { t } = useTranslation();
  if (!selectedItem) {
    return (
      <aside className={`${parentStyles.craftingPanel} ${isOpen ? parentStyles.open : ''}`}>
        <button className={parentStyles.closeButton} onClick={onClose}>✕</button>
        <div className={parentStyles.emptyState}>
          <p>{t('items.selectItem')}</p>
        </div>
      </aside>
    );
  }

  const cleanDescription = (desc: string) => {
    let cleanDesc = desc;
    const cutoffWords = ['Recipe', 'Price', 'In-depth', 'Visual effect', 'Builds', 'Sellable'];
    for (const word of cutoffWords) {
      const index = cleanDesc.indexOf(word);
      if (index > 0) {
        cleanDesc = cleanDesc.substring(0, index);
      }
    }
    return cleanDesc.trim() || t('items.noDescription');
  };

  const stats: Record<string, number | undefined> = {
    [t('items.statLabels.physicalAttack')]: selectedItem.physical_attack,
    [t('items.statLabels.magicPower')]: selectedItem.magic_power,
    [t('items.statLabels.attackSpeed')]: selectedItem.attack_speed,
    [t('items.statLabels.physicalDefense')]: selectedItem.physical_defense,
    [t('items.statLabels.magicDefense')]: selectedItem.magic_defense,
    [t('items.statLabels.hp')]: selectedItem.hp,
    [t('items.statLabels.manaRegen')]: selectedItem.mana_regen,
    [t('items.statLabels.cdr')]: selectedItem.cooldown_reduction,
    [t('items.statLabels.critChance')]: selectedItem.crit_chance,
    [t('items.statLabels.lifesteal')]: selectedItem.lifesteal,
    [t('items.statLabels.movementSpeed')]: selectedItem.movement_speed,
  };
  const filteredStats = Object.entries(stats).filter(([_, value]) => value !== undefined && value !== null);

  const renderRecipeTree = (item: Item, level: number = 0): React.ReactElement[] => {
    const components = getCraftingTree(item);
    if (components.length === 0) return [];

    return components.map(comp => (
      <React.Fragment key={`${comp.id}-${level}`}>
        <div 
          className={parentStyles.baseItem}
          data-tier={comp.tier}
          style={{ paddingLeft: `${level * 40 + 8}px` }}
          onClick={() => onItemClick(comp)}
        >
          <div className={parentStyles.itemIcon}>
            {comp.icon_url && <img src={comp.icon_url} alt={comp.name} />}
          </div>
          <div className={parentStyles.itemInfo}>
            <div className={parentStyles.itemName}>{comp.display_name || comp.name}</div>
            <div className={parentStyles.itemMeta}>
              {comp.tier && <span className={parentStyles.tier} data-tier={comp.tier}>T{comp.tier}</span>}
              <span className={parentStyles.price}>💰 {comp.price_total}</span>
            </div>
          </div>
        </div>
        {renderRecipeTree(comp, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <aside className={`${parentStyles.craftingPanel} ${isOpen ? parentStyles.open : ''}`}>
      <button className={parentStyles.closeButton} onClick={onClose}>✕</button>
      
      <div className={parentStyles.selectedItemHeader}>
        <div className={parentStyles.selectedItemIcon}>
          {selectedItem.icon_url && <img src={selectedItem.icon_url} alt={selectedItem.name} />}
        </div>
        <div>
          <h2>{selectedItem.display_name || selectedItem.name}</h2>
          <div className={parentStyles.priceInfo}>
            {selectedItem.price_total && (
              <div className={parentStyles.itemPrice}>
                <span className={parentStyles.goldIcon}>💰</span>
                <span>{t('items.buy')}: {selectedItem.price_total}</span>
              </div>
            )}
            {selectedItem.price_total && (
              <div className={parentStyles.itemPrice}>
                <span className={parentStyles.goldIcon}>💰</span>
                <span>{t('items.sell')}: {selectedItem.price_sell && selectedItem.price_sell > 0 
                  ? selectedItem.price_sell 
                  : Math.round(selectedItem.price_total * 0.6)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedItem.description && (
        <div className={parentStyles.itemDescription}>
          <p>{cleanDescription(selectedItem.description)}</p>
        </div>
      )}

      {filteredStats.length > 0 && (
        <div className={parentStyles.itemStats}>
          <h3>{t('items.stats')}</h3>
          {filteredStats.map(([stat, value]) => (
            <div key={stat} className={parentStyles.statRow}>
              <span className={parentStyles.statName}>{stat}</span>
              <span className={parentStyles.statValue}>+{value}</span>
            </div>
          ))}
        </div>
      )}

      {craftingComponents.length > 0 && (
        <div className={parentStyles.craftingTree}>
          <h3>{t('items.recipe')}</h3>
          
          <div className={parentStyles.selectedResult}>
            <div className={parentStyles.resultCard} onClick={() => onItemClick(selectedItem)}>
              <div className={parentStyles.itemIcon}>
                {selectedItem.icon_url && <img src={selectedItem.icon_url} alt={selectedItem.name} />}
              </div>
              <div className={parentStyles.itemInfo}>
                <div className={parentStyles.itemTitle}>{selectedItem.display_name || selectedItem.name}</div>
                <div className={parentStyles.itemPrice}>💰 {selectedItem.price_total}</div>
              </div>
            </div>
          </div>

          <div className={parentStyles.requiredSection}>
            <div className={parentStyles.sectionTitle}>{t('items.fullRecipe')}</div>
            <div className={parentStyles.itemsList}>
              {renderRecipeTree(selectedItem)}
            </div>
          </div>
        </div>
      )}

      {usedInItems.length > 0 && (
        <div className={parentStyles.usedInSection}>
          <h3>{t('items.buildsInto')}</h3>
          <div className={parentStyles.usedInList}>
            {usedInItems.map(item => (
              <div 
                key={item.id}
                className={parentStyles.usedInItem}
                data-tier={item.tier}
                onClick={() => onItemClick(item)}
              >
                <div className={parentStyles.itemIcon}>
                  {item.icon_url && <img src={item.icon_url} alt={item.name} />}
                </div>
                <div className={parentStyles.itemInfo}>
                  <div className={parentStyles.itemName}>{item.display_name || item.name}</div>
                  <div className={parentStyles.itemMeta}>
                    {item.tier && <span className={parentStyles.tier} data-tier={item.tier}>T{item.tier}</span>}
                    <span className={parentStyles.price}>💰 {item.price_total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
