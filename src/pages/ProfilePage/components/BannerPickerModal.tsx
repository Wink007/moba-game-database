import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BannerPickerModalProps } from '../types';
import styles from '../styles.module.scss';

export const BannerPickerModal: React.FC<BannerPickerModalProps> = ({ heroes, currentBannerHeroId, onSelect, onClose, saving }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = search
    ? heroes.filter((h: any) => h.name.toLowerCase().includes(search.toLowerCase()))
    : heroes;

  return (
    <div className={styles.pickerOverlay} onClick={onClose}>
      <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
        <h3>{t('profile.bannerChooseHero')}</h3>
        <input
          className={styles.pickerSearch}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          autoFocus
        />
        <div className={styles.pickerGrid}>
          {filtered.map((h: any) => (
            <button
              key={h.id}
              className={`${styles.pickerHero} ${currentBannerHeroId === h.id ? styles.active : ''}`}
              onClick={() => onSelect(h.id)}
              disabled={saving}
            >
              <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
              <span>{h.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
