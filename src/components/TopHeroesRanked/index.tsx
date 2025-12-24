import { Link } from 'react-router-dom';
import { useHeroRanks } from '../../hooks/useHeroes';
import { useGameStore } from '../../store/gameStore';
import styles from './styles.module.scss';

const HeroRankSkeleton = () => (
  <div className={styles.heroList}>
    {[...Array(5)].map((_, index) => (
      <div key={index} className={styles.heroCardSkeleton} />
    ))}
  </div>
);

export const TopHeroesRanked = () => {
  const { selectedGameId } = useGameStore();
  
  // Get top 5 heroes for ALL ranks, 30 days period, sorted by win rate
  const { data: heroRanks, isLoading, isError } = useHeroRanks(
    selectedGameId, 
    1, // page
    5, // size - top 5
    30, // days
    'glory', // rank - all ranks (like mobilelegends.com default)
    'win_rate', // sort by win rate
    'desc' // descending order
  );

  console.log(heroRanks);

  if (!selectedGameId) return null;
  if (isError) return <div className={styles.error}>Failed to load rankings</div>;
  
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Top 5 Heroes Ranking</h2>
          <div className={styles.periodSkeleton} />
        </div>
        <HeroRankSkeleton />
      </div>
    );
  }
  
  if (!heroRanks || heroRanks.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Top 5 Heroes Ranking</h4>
        <div className={styles.period}>
          <span>Last 30 Days - Mythic Glory Ranks</span>
          <p>Updated Time: {heroRanks[0].updated_at}</p>
        </div>
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
                <img src={hero.head || hero.image} alt={hero.name} />
              </div>
              
              <div className={styles.heroInfo}>
                <h3 className={styles.heroName}>{hero.name}</h3>
              </div>
            </Link>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Win Rate</span>
                <span className={styles.statValue}>
                  {(hero.win_rate * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className={styles.stat}>
                <span className={styles.statLabel}>Pick Rate</span>
                <span className={styles.statValue}>
                  {(hero.appearance_rate * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className={styles.stat}>
                <span className={styles.statLabel}>Ban Rate</span>
                <span className={styles.statValue}>
                  {(hero.ban_rate * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
