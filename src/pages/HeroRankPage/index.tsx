import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHeroesQuery, useHeroRanksQuery, useHeroCounterDataQuery } from '../../queries/useHeroesQuery';
import LoadMoreButton from '../../components/LoadMoreButton';
import { FilterSection, FilterGroup } from '../../components/FilterSection';
import styles from './styles.module.scss';
import { useGameStore } from '../../store/gameStore';
import { getDaysOptions, getRankOptions, getSortOptions, ITEMS_PER_PAGE } from './constants';
import { HeroRankSkeleton } from './components/HeroRankSkeleton';
import { HeroRankCard } from './components/HeroRankCard';
import { useSEO } from '../../hooks/useSEO';

export const HeroRankPage = () => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  useSEO({ title: 'Hero Rankings', description: 'Mobile Legends hero tier list — win rates, ban rates and pick rates by rank.' });
  const [days, setDays] = useState(1);
  const [rank, setRank] = useState('all');
  const [sortField, setSortField] = useState<'win_rate' | 'ban_rate' | 'pick_rate'>('win_rate');
  const [page, setPage] = useState(1);
  const [allHeroes, setAllHeroes] = useState<any[]>([]);

  const { data: heroRanksData, isLoading, isError } = useHeroRanksQuery(
    selectedGameId,
    page,
    ITEMS_PER_PAGE,
    days,
    rank,
    sortField,
    'desc'
  );

  const { data: heroes } = useHeroesQuery(selectedGameId);
  const { data: counterData } = useHeroCounterDataQuery(selectedGameId, rank);

  useEffect(() => {
    if (heroRanksData && !isLoading) {
      if (page === 1) {
        setAllHeroes(heroRanksData);
      } else {
        setAllHeroes(prev => {
          const existingIds = new Set(prev.map(h => h.id));
          const newHeroes = heroRanksData.filter(h => !existingIds.has(h.id));
          return newHeroes.length > 0 ? [...prev, ...newHeroes] : prev;
        });
      }
    }
  }, [heroRanksData, isLoading, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleFilterChange = () => {
    setPage(1);
    setAllHeroes([]);
  };

  const filterGroups: FilterGroup[] = [
    {
      label: t('heroRank.filters.timePeriod'),
      emoji: '⏱️',
      options: getDaysOptions(t),
      selectedValue: days,
      onChange: (value) => {
        setDays(Number(value));
        handleFilterChange();
      }
    },
    {
      label: t('heroRank.filters.rankTier'),
      emoji: '🏆',
      options: getRankOptions(t),
      selectedValue: rank,
      onChange: (value) => {
        setRank(value);
        handleFilterChange();
      }
    },
    {
      label: t('heroRank.filters.sortBy'),
      emoji: '📊',
      options: getSortOptions(t),
      selectedValue: sortField,
      onChange: (value) => {
        setSortField(value as 'win_rate' | 'ban_rate' | 'pick_rate');
        handleFilterChange();
      }
    }
  ];

  const displayHeroes = page === 1 ? heroRanksData || [] : allHeroes;
  const hasMore = heroRanksData && heroRanksData.length === ITEMS_PER_PAGE;

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{t('common.error')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{t('heroRank.title')}</h1>
          <p className={styles.subtitle}>{t('heroRank.description')}</p>
        </div>

        <FilterSection filterGroups={filterGroups} collapsible={true} defaultExpanded={false} />
      </div>

      <div className={styles.tableHeader}>
        <div className={styles.headerRank}>#</div>
        <div className={styles.headerHero}>{t('heroRank.hero')}</div>
        <div className={styles.headerStat}>{t('heroRank.pickRate')}</div>
        <div className={styles.headerStat}>{t('heroRank.winRate')}</div>
        <div className={styles.headerStat}>{t('heroRank.banRate')}</div>
        <div className={styles.headerSynergy}>{t('heroDetail.bestCounters')}</div>
      </div>

      <div className={styles.heroGrid}>
        {isLoading && page === 1 ? (
          <HeroRankSkeleton count={ITEMS_PER_PAGE} />
        ) : (
          displayHeroes.map((hero, index) => (
            <HeroRankCard
              key={`${hero.id}-${index}`}
              hero={hero}
              index={index}
              heroes={heroes}
              counterData={counterData}
              selectedGameId={selectedGameId}
            />
          ))
        )}

        {isLoading && page > 1 && (
          <HeroRankSkeleton count={ITEMS_PER_PAGE} />
        )}
      </div>

      {hasMore && !isLoading && (
        <LoadMoreButton onClick={handleLoadMore}>
          {t('heroRank.showMore')}
        </LoadMoreButton>
      )}

      {!isLoading && displayHeroes.length === 0 && (
        <div className={styles.noData}>
          {t('heroRank.noData')}
        </div>
      )}
    </div>
  );
};
