import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useHeroes } from '../../hooks/useHeroes';
import { useItems } from '../../hooks/useItems';
import styles from './styles.module.scss';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { selectedGameId } = useGameStore();
  const { data: heroes } = useHeroes(selectedGameId);
  const { data: items } = useItems(selectedGameId);

  // Фільтруємо героїв по запиту
  const filteredHeroes = heroes?.filter(hero =>
    hero.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) || [];

  // Фільтруємо предмети по запиту
  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) || [];

  const hasResults = filteredHeroes.length > 0 || filteredItems.length > 0;

  // Закриваємо при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (heroId: number) => {
    navigate(`/${selectedGameId}/heroes/${heroId}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectItem = (itemId: number) => {
    navigate(`/${selectedGameId}/items/${itemId}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
  };

  return (
    <div className={styles.searchBar} ref={searchRef}>
      <div className={styles.searchInput}>
        <svg 
          className={styles.searchIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" strokeWidth="2"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder="Search heroes, items..."
          className={styles.input}
        />
        {query && (
          <button 
            className={styles.clearButton}
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && hasResults && (
        <div className={styles.dropdown}>
          {filteredHeroes.length > 0 && (
            <>
              <div className={styles.dropdownHeader}>Heroes</div>
              {filteredHeroes.map(hero => (
                <div
                  key={hero.id}
                  className={styles.dropdownItem}
                  onClick={() => handleSelect(hero.id)}
                >
                  <div className={styles.heroInfo}>
                    <span className={styles.heroName}>{hero.name}</span>
                    <div className={styles.heroRoles}>
                        {hero.roles.map(role => (
                            <span key={role} className={styles.heroRole}>{role}</span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredItems.length > 0 && (
            <>
              <div className={styles.dropdownHeader}>Items</div>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectItem(item.id)}
                >
                  <div className={styles.heroInfo}>
                    <span className={styles.heroName}>{item.name}</span>
                    <span className={styles.heroRole}>{item.category || 'Item'}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {isOpen && query.length > 0 && !hasResults && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>No results found</div>
        </div>
      )}
    </div>
  );
};
