import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authFetch, useAuthStore } from '../../store/authStore';
import { useHeroesQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { queryKeys } from '../../queries/keys';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import styles from './styles.module.scss';

interface MainHero {
  hero_id: number;
  position: number;
  name: string;
  head?: string;
  image?: string;
}

export const MainHeroSelector: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const { selectedGameId } = useGameStore();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const { data: mainHeroes = [] } = useQuery<MainHero[]>({
    queryKey: queryKeys.mainHeroes.current,
    queryFn: () => authFetch('/user/main-heroes'),
    enabled: !!user,
  });

  const { data: heroes = [] } = useHeroesQuery(selectedGameId);

  const mutation = useMutation({
    mutationFn: (heroIds: number[]) =>
      authFetch('/user/main-heroes', {
        method: 'PUT',
        body: JSON.stringify({ heroes: heroIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mainHeroes.current });
    },
  });

  const selectedIds = useMemo(() => mainHeroes.map(h => h.hero_id), [mainHeroes]);

  const handleToggle = useCallback((heroId: number) => {
    let next: number[];
    if (selectedIds.includes(heroId)) {
      next = selectedIds.filter(id => id !== heroId);
    } else {
      if (selectedIds.length >= 3) return; // max 3
      next = [...selectedIds, heroId];
    }
    mutation.mutate(next);
  }, [selectedIds, mutation]);

  const handleRemove = useCallback((heroId: number) => {
    const next = selectedIds.filter(id => id !== heroId);
    mutation.mutate(next);
  }, [selectedIds, mutation]);

  useEscapeKey(useCallback(() => setShowPicker(false), []), showPicker);

  const filteredHeroes = useMemo(() => {
    if (!search) return heroes;
    const q = search.toLowerCase();
    return heroes.filter((h: any) => h.name?.toLowerCase().includes(q));
  }, [heroes, search]);

  if (!user) return null;

  return (
    <div className={styles.mainHeroSection}>
      <div className={styles.mainHeroHeader}>
        <h3 className={styles.mainHeroTitle}>{t('profile.mainHeroes')}</h3>
        <button className={styles.mainHeroEditBtn} onClick={() => setShowPicker(!showPicker)}>
          {showPicker ? t('common.close') : t('common.edit')}
        </button>
      </div>

      {/* Current mains display */}
      <div className={styles.mainHeroSlots}>
        {[0, 1, 2].map(idx => {
          const hero = mainHeroes[idx];
          return (
            <div key={idx} className={`${styles.mainHeroSlot} ${hero ? styles.mainHeroSlotFilled : ''}`}>
              {hero ? (
                <>
                  <img
                    src={hero.head || hero.image || ''}
                    alt={hero.name}
                    className={styles.mainHeroImg}
                    loading="lazy"
                  />
                  <span className={styles.mainHeroName}>{hero.name}</span>
                  {showPicker && (
                    <button className={styles.mainHeroRemove} onClick={() => handleRemove(hero.hero_id)}>×</button>
                  )}
                </>
              ) : (
                <div className={styles.mainHeroEmpty}>
                  <span>+</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hero picker */}
      {showPicker && (
        <div className={styles.mainHeroPicker}>
          <input
            type="text"
            className={styles.mainHeroSearch}
            placeholder={t('heroes.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.mainHeroGrid}>
            {filteredHeroes.map((hero: any) => {
              const isSelected = selectedIds.includes(hero.id);
              const isFull = selectedIds.length >= 3 && !isSelected;
              return (
                <button
                  key={hero.id}
                  className={`${styles.mainHeroOption} ${isSelected ? styles.mainHeroOptionSelected : ''} ${isFull ? styles.mainHeroOptionDisabled : ''}`}
                  onClick={() => !isFull && handleToggle(hero.id)}
                  disabled={isFull}
                >
                  <img src={hero.head || hero.image || ''} alt={hero.name} loading="lazy" />
                  <span>{hero.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
