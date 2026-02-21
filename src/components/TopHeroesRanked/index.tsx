import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName } from '../../utils/translation';
import { useHeroRanksQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import styles from './styles.module.scss';

const HeroRankSkeleton = () => (
  <div className={styles.heroList}>
    {[...Array(5)].map((_, index) => (
      <div key={index} className={`${styles.heroCardSkeleton} ${
        index === 0 ? styles.first : index === 1 ? styles.second : index === 2 ? styles.third : ''
      }`}>
        <div className={styles.skeletonRank} />
        <div className={styles.skeletonHero}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonName} />
        </div>
        <div className={styles.skeletonStatsRow}>
          <div className={styles.skeletonStat} />
          <div className={styles.skeletonStat} />
          <div className={styles.skeletonStat} />
        </div>
      </div>
    ))}
  </div>
);

export const TopHeroesRanked = () => {
  const { t, i18n } = useTranslation();
  const { selectedGameId } = useGameStore();
  
  // Get top 5 heroes for ALL ranks, 30 days period, sorted by win rate
  const { data: heroRanks, isLoading, isError } = useHeroRanksQuery(
    selectedGameId, 
    1, // page
    5, // size - top 5
    30, // days
    'glory', // rank - all ranks (like mobilelegends.com default)
    'win_rate', // sort by win rate
    'desc' // descending order
  );

  if (!selectedGameId) return null;
  if (isError) return <div className={styles.error}>{t('heroRank.noData')}</div>;
  
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h4 className={styles.title}>{t('home.topHeroesRanking')}</h4>
          <div className={styles.period}>
            <span>{t('home.lastDays', { days: 30 })}</span>
            <p className={styles.periodSkeleton} />
          </div>
        </div>
        <div className={styles.tableHeader}>
          <div />
          <div>{t('heroRank.hero')}</div>
          <div className={styles.headerStat}>{t('heroRank.winRate')}</div>
          <div className={styles.headerStat}>{t('heroRank.pickRate')}</div>
          <div className={styles.headerStat}>{t('heroRank.banRate')}</div>
        </div>
        <HeroRankSkeleton />
      </div>
    );
  }
  
  if (!heroRanks || heroRanks.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>{t('home.topHeroesRanking')}</h4>
        <div className={styles.period}>
          <span>{t('home.lastDays', { days: 30 })}</span>
          <p>{t('home.updatedTime', { time: heroRanks[0].updated_at })}</p>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <div />
        <div>{t('heroRank.hero')}</div>
        <div className={styles.headerStat}>{t('heroRank.winRate')}</div>
        <div className={styles.headerStat}>{t('heroRank.pickRate')}</div>
        <div className={styles.headerStat}>{t('heroRank.banRate')}</div>
      </div>
      
      <div className={styles.heroList}>
        {heroRanks.map((hero, index) => (
          <div 
            key={hero.id} 
            className={`${styles.heroCard} ${
              index === 0 ? styles.first : 
              index === 1 ? styles.second : 
              index === 2 ? styles.third : ''
            }`}
          >
            <div className={styles.rank}>{index + 1}</div>
            
            <Link to={`${selectedGameId}/heroes/${hero.hero_id}`} className={styles.heroLink}>
              <div className={styles.heroImage}>
                <img src={hero.head || hero.image} alt={getHeroName(hero, i18n.language)} />
              </div>
              <span className={styles.heroName}>{getHeroName(hero, i18n.language)}</span>
            </Link>

            <div className={styles.statsRow}>
              <div className={styles.statValue} data-label={t('heroRank.winRate')}>
                {hero.win_rate.toFixed(2)}%
              </div>

              <div className={styles.statValue} data-label={t('heroRank.pickRate')}>
                {hero.appearance_rate.toFixed(2)}%
              </div>

              <div className={styles.statValue} data-label={t('heroRank.banRate')}>
                {hero.ban_rate.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
