import { Link } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { Loader } from '../Loader';
import { Chart } from './Chart';
import { getRange } from './utils';
import { useHeroStats } from './useHeroStats';
import styles from './styles.module.scss';

export const RandomHeroStats = () => {
  const { selectedGameId } = useGameStore();
  const { isLoading, isError, hero, data } = useHeroStats(selectedGameId);

  if (isLoading) return <Loader />;
  if (isError || !hero || !data) return null;

  const winRateRange = getRange(data.winRate.data);
  const banRateRange = getRange(data.banRate.data);

  return (
    <div className={styles.container}>
      <Link to={`/${selectedGameId}/heroes/${hero.hero_id}`} className={styles.heroSection}>
        {hero.head && <img src={hero.head} alt={hero.name} className={styles.heroImage} />}
        <div className={styles.heroInfo}>
          <h3 className={styles.heroName}>{hero.name}</h3>
          {hero.roles && hero.roles.length > 0 && (
            <div className={styles.heroRoles}>{hero.roles.join(', ')}</div>
          )}
        </div>
      </Link>

      <div className={styles.chartsContainer}>
        <Chart
          data={data.winRate.data}
          min={winRateRange.min}
          max={winRateRange.max}
          currentValue={hero.win_rate}
          trend={data.winRate.trend}
          title="Win Rate"
          color="green"
          gradientId="winRateGradient"
        />
        
        <Chart
          data={data.banRate.data}
          min={banRateRange.min}
          max={banRateRange.max}
          currentValue={hero.ban_rate}
          trend={data.banRate.trend}
          title="Ban Rate"
          color="red"
          gradientId="banRateGradient"
        />
      </div>
    </div>
  );
};
