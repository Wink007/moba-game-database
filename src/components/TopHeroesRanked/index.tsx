import { useHeroRanks } from '../../hooks/useHeroes';
import { useGameStore } from '../../store/gameStore';
import { Loader } from '../Loader';
import styles from './styles.module.scss';

export const TopHeroesRanked = () => {
  const { selectedGameId } = useGameStore();
  
  // Get top 5 heroes for ALL ranks, 30 days period, sorted by win rate
  const { data: heroRanks, isLoading, isError } = useHeroRanks(
    selectedGameId, 
    1, // page
    5, // size - top 5
    30, // days
    'all', // rank - all ranks (like mobilelegends.com default)
    'win_rate', // sort by win rate
    'desc' // descending order
  );

  if (!selectedGameId) return null;
  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>Failed to load rankings</div>;
  if (!heroRanks || heroRanks.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🏆 Top 5 Heroes Ranking</h2>
        <span className={styles.period}>Last 30 Days - All Ranks</span>
      </div>
      
      <div className={styles.heroList}>
        {heroRanks.map((hero, index) => (
          <div key={hero.id} className={styles.heroCard}>
            <div className={styles.rank}>#{index + 1}</div>
            
            <div className={styles.heroImage}>
              <img src={hero.head || hero.image} alt={hero.name} />
            </div>
            
            <div className={styles.heroInfo}>
              <h3 className={styles.heroName}>{hero.name}</h3>
              <div className={styles.roles}>
                {hero.roles?.slice(0, 2).map((role: string) => (
                  <span key={role} className={styles.role}>{role}</span>
                ))}
              </div>
            </div>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Win Rate</span>
                <span className={styles.statValue}>
                  {(hero.win_rate * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className={styles.stat}>
                <span className={styles.statLabel}>Pick Rate</span>
                <span className={styles.statValue}>
                  {(hero.appearance_rate * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className={styles.stat}>
                <span className={styles.statLabel}>Ban Rate</span>
                <span className={styles.statValue}>
                  {(hero.ban_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
