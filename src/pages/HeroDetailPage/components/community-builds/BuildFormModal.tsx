import React from 'react';
import { useTranslation } from 'react-i18next';
import { getEmblemName, getTalentName, getTalentEffect } from '../../../../utils/translation';
import type { BuildFormModalProps } from './interface';
import styles from '../../styles.module.scss';

export const BuildFormModal: React.FC<BuildFormModalProps> = ({
  editingBuild,
  buildName, setBuildName,
  selectedItems,
  selectedEmblem, setSelectedEmblem,
  selectedSpell1, setSelectedSpell1,
  selectedSpell2, setSelectedSpell2,
  selectedTalents, setSelectedTalents,
  notes, setNotes,
  itemSearch, setItemSearch,
  saving,
  filteredItems, itemsMap, spells, emblems,
  tier1, tier2, tier3,
  toggleItem, onSave, onClose,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className={styles.cbOverlay} onClick={onClose}>
      <div className={styles.cbModal} onClick={e => e.stopPropagation()}>
        <div className={styles.cbModalHeader}>
          <h3>{editingBuild ? t('builds.edit') : t('builds.create')}</h3>
          <button className={styles.cbCloseBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.cbFormBody}>
          {/* Build Name */}
          <div className={styles.cbFormGroup}>
            <label>{t('builds.name')}</label>
            <input
              type="text"
              value={buildName}
              onChange={e => setBuildName(e.target.value)}
              placeholder={t('builds.namePlaceholder')}
              className={styles.cbInput}
              maxLength={50}
            />
          </div>

          {/* Items Selection */}
          <div className={styles.cbFormGroup}>
            <label>{t('builds.items')} ({selectedItems.length}/6)</label>
            <div className={styles.cbSelectedItems}>
              {[0, 1, 2, 3, 4, 5].map(slot => {
                const itemId = selectedItems[slot];
                const item = itemId ? itemsMap.get(itemId) : null;
                return (
                  <div
                    key={slot}
                    className={`${styles.cbSlot} ${item ? styles.cbSlotFilled : ''}`}
                    onClick={() => item && toggleItem(item.id)}
                    title={item ? `${item.name} (${t('builds.clickToRemove')})` : t('builds.emptySlot')}
                  >
                    {item?.icon_url ? <img src={item.icon_url} alt={item.name} /> : <span>{slot + 1}</span>}
                  </div>
                );
              })}
            </div>
            <input
              type="text"
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
              placeholder={t('builds.searchItems')}
              className={styles.cbInput}
            />
            <div className={styles.cbItemGrid}>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.cbItemPick} ${selectedItems.includes(item.id) ? styles.cbItemPicked : ''}`}
                  onClick={() => toggleItem(item.id)}
                  title={item.name}
                  disabled={selectedItems.length >= 6 && !selectedItems.includes(item.id)}
                >
                  {item.icon_url ? <img src={item.icon_url} alt={item.name} loading="lazy" /> : <span>{item.name?.slice(0, 2)}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Spell Selection */}
          <div className={styles.cbFormGroup}>
            <label>{t('builds.spells')}</label>
            <div className={styles.cbSpellRow}>
              {spells.map(spell => (
                <button
                  key={spell.id}
                  className={`${styles.cbSpellPick} ${selectedSpell1 === spell.id || selectedSpell2 === spell.id ? styles.cbSpellPicked : ''}`}
                  onClick={() => {
                    if (selectedSpell1 === spell.id) setSelectedSpell1(null);
                    else if (selectedSpell2 === spell.id) setSelectedSpell2(null);
                    else if (!selectedSpell1) setSelectedSpell1(spell.id);
                    else if (!selectedSpell2) setSelectedSpell2(spell.id);
                  }}
                  title={spell.name}
                >
                  {spell.icon_url && <img src={spell.icon_url} alt={spell.name} loading="lazy" />}
                  <span>{spell.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emblem Selection */}
          <div className={styles.cbFormGroup}>
            <label>{t('builds.emblem')}</label>
            <div className={styles.cbEmblemRow}>
              {emblems.map(emblem => (
                <button
                  key={emblem.id}
                  className={`${styles.cbEmblemPick} ${selectedEmblem === emblem.id ? styles.cbEmblemPicked : ''}`}
                  onClick={() => {
                    if (selectedEmblem === emblem.id) {
                      setSelectedEmblem(null);
                    } else {
                      setSelectedEmblem(emblem.id);
                    }
                    setSelectedTalents([]);
                  }}
                  title={getEmblemName(emblem, lang)}
                >
                  {emblem.icon_url && <img src={emblem.icon_url} alt={getEmblemName(emblem, lang)} loading="lazy" />}
                  <span>{getEmblemName(emblem, lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Talent Selection */}
          {selectedEmblem && (
            <div className={styles.cbFormGroup}>
              <label>{t('builds.talents')}</label>
              {[tier1, tier2, tier3].map((tierTalents, tierIdx) => (
                <div key={tierIdx} className={styles.cbTalentTier}>
                  <span className={styles.cbTalentTierLabel}>Tier {tierIdx + 1}</span>
                  <div className={styles.cbTalentRow}>
                    {tierTalents.map(talent => {
                      const isSelected = selectedTalents.includes(talent.name);
                      return (
                        <button
                          key={talent.id}
                          className={`${styles.cbTalentPick} ${isSelected ? styles.cbTalentPicked : ''}`}
                          onClick={() => {
                            setSelectedTalents(prev => {
                              const otherTierNames = tierTalents.map(t => t.name);
                              const withoutThisTier = prev.filter(n => !otherTierNames.includes(n));
                              if (isSelected) return withoutThisTier;
                              return [...withoutThisTier, talent.name];
                            });
                          }}
                          title={getTalentEffect(talent, lang) || getTalentName(talent, lang)}
                        >
                          {talent.icon_url && <img src={talent.icon_url} alt={getTalentName(talent, lang)} loading="lazy" />}
                          <span>{getTalentName(talent, lang)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className={styles.cbFormGroup}>
            <label>{t('builds.notes')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('builds.notesPlaceholder')}
              className={styles.cbTextarea}
              maxLength={500}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.cbModalFooter}>
          <button className={styles.cbCancelBtn} onClick={onClose}>{t('builds.cancel')}</button>
          <button
            className={styles.cbSaveBtn}
            onClick={onSave}
            disabled={saving || !buildName.trim() || selectedItems.length === 0}
          >
            {saving ? '...' : t('builds.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
