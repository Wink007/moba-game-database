import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName, translateRoles } from '../../utils/translation';
import { useGameStore } from '../../store/gameStore';
import { useHeroSearchQuery } from '../../queries/useHeroesQuery';
import { useItemsQuery } from '../../queries/useItemsQuery';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useAdBannerPause } from '../../hooks/useAdBannerPause';
import styles from './styles.module.scss';

export const SearchBar: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  useAdBannerPause(isOpen);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { selectedGameId } = useGameStore();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: heroSearchResult } = useHeroSearchQuery(selectedGameId, debouncedQuery);
  const { data: items } = useItemsQuery(selectedGameId);

  // Heroes from server-side search
  const filteredHeroes = heroSearchResult?.data?.slice(0, 5) || [];

  // Фільтруємо предмети по запиту
  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) || [];

  const hasResults = filteredHeroes.length > 0 || filteredItems.length > 0;
  const totalResults = filteredHeroes.length + filteredItems.length;

  useClickOutside(searchRef, useCallback(() => setIsOpen(false), []));

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredHeroes.length, filteredItems.length]);

  const handleSelect = (heroId: number) => {
    navigate(`/${selectedGameId}/heroes/${heroId}`);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect?.();
  };

  const handleSelectItem = (itemId: number) => {
    navigate(`/${selectedGameId}/items/${itemId}`);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length > 0);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !hasResults) {
      if (e.key === 'Escape') {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % totalResults);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev <= 0 ? totalResults - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          if (activeIndex < filteredHeroes.length) {
            handleSelect(filteredHeroes[activeIndex].id);
          } else {
            handleSelectItem(filteredItems[activeIndex - filteredHeroes.length].id);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
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
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" strokeWidth="2"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className={styles.input}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={!!(isOpen && hasResults)}
          aria-haspopup="listbox"
          aria-controls={isOpen && hasResults ? 'search-listbox' : undefined}
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
        />
        {query && (
          <button 
            className={styles.clearButton}
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setActiveIndex(-1);
            }}
            aria-label={t('search.clear') || 'Clear search'}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && hasResults && (
        <div className={styles.dropdown} role="listbox" id="search-listbox">
          {filteredHeroes.length > 0 && (
            <>
              <div className={styles.dropdownHeader} role="presentation">{t('search.heroes')}</div>
              {filteredHeroes.map((hero, idx) => (
                <div
                  key={hero.id}
                  id={`search-option-${idx}`}
                  className={`${styles.dropdownItem} ${activeIndex === idx ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSelect(hero.id)}
                  role="option"
                  aria-selected={activeIndex === idx}
                >
                  <div className={styles.heroInfo}>
                    <span className={styles.heroName}>{getHeroName(hero, currentLanguage)}</span>
                    <div className={styles.heroRoles}>
                        {translateRoles(hero.roles, currentLanguage).map((role, index) => (
                            <span key={index} className={styles.heroRole}>{role}</span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredItems.length > 0 && (
            <>
              <div className={styles.dropdownHeader} role="presentation">{t('search.items')}</div>
              {filteredItems.map((item, idx) => {
                const optionIdx = filteredHeroes.length + idx;
                return (
                  <div
                    key={item.id}
                    id={`search-option-${optionIdx}`}
                    className={`${styles.dropdownItem} ${activeIndex === optionIdx ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSelectItem(item.id)}
                    role="option"
                    aria-selected={activeIndex === optionIdx}
                  >
                    <div className={styles.heroInfo}>
                      <span className={styles.heroName}>{item.name}</span>
                      <span className={styles.heroRole}>{item.category || 'Item'}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {isOpen && query.length > 0 && !hasResults && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>{t('search.noResults')}</div>
        </div>
      )}
    </div>
  );
};
