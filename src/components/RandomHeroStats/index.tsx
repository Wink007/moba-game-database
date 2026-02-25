import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName, translateRoles } from '../../utils/translation';
import { useGameStore } from '../../store/gameStore';
import { Chart } from './Chart';
import { getRange } from './utils';
import { useHeroStats } from './useHeroStats';
import styles from './styles.module.scss';

const SkeletonChartCard = ({ variant }: { variant: 'green' | 'red' }) => {
  const bars = [38, 52, 44, 65, 48, 72, 56, 60, 42, 68, 50, 58];
  return (
    <div className={`${styles.skeletonChartCard} ${styles[`skeletonGlow${variant === 'green' ? 'Green' : 'Red'}`]}`}>
      <div className={styles.skeletonChartHeader}>
        <div className={styles.skeletonShimmer} style={{ width: '100px', height: '10px' }} />
        <div className={styles.skeletonShimmer} style={{ width: '72px', height: '26px', marginTop: '10px', borderRadius: '8px' }} />
      </div>
      <div className={styles.skeletonChartWave}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={`${styles.skeletonBar} ${styles[`skeletonBar${variant === 'green' ? 'Green' : 'Red'}`]}`}
            style={{ '--bar-h': `${h}%`, '--bar-delay': `${i * 0.12}s` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

const RandomHeroSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.heroSection} style={{ pointerEvents: 'none' }}>
      <div className={styles.skeletonAvatar}>
        <div className={styles.skeletonAvatarRing} />
      </div>
      <div className={styles.heroInfo}>
        <div className={styles.skeletonShimmer} style={{ width: '130px', height: '18px' }} />
        <div className={styles.skeletonShimmer} style={{ width: '90px', height: '12px' }} />
      </div>
    </div>
    <div className={styles.chartsContainer}>
      <SkeletonChartCard variant="green" />
      <SkeletonChartCard variant="red" />
    </div>
  </div>
);

export const RandomHeroStats = () => {
  const { t, i18n } = useTranslation();
  const { selectedGameId } = useGameStore();
  const { isLoading, isError, hero, data } = useHeroStats(selectedGameId);

  if (isLoading) return <RandomHeroSkeleton />;
  if (isError || !hero || !data) return <div className={styles.container} style={{ minHeight: '280px' }} />;

  const winRateRange = getRange(data.winRate.data);
  const banRateRange = getRange(data.banRate.data);

  return (
    <div className={styles.container}>
      <Link to={`/${selectedGameId}/heroes/${hero.hero_id}`} className={styles.heroSection}>
        {hero.head && <img src={hero.head} alt={getHeroName(hero, i18n.language)} className={styles.heroImage} />}
        <div className={styles.heroInfo}>
          <h3 className={styles.heroName}>{getHeroName(hero, i18n.language)}</h3>
          {hero.roles && hero.roles.length > 0 && (
            <div className={styles.heroRoles}>
              {translateRoles(hero.roles, i18n.language).join(', ')}
            </div>
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
          title={t('home.stats.winRate')}
          color="green"
          gradientId="winRateGradient"
        />
        
        <Chart
          data={data.banRate.data}
          min={banRateRange.min}
          max={banRateRange.max}
          currentValue={hero.ban_rate}
          trend={data.banRate.trend}
          title={t('home.stats.banRate')}
          color="red"
          gradientId="banRateGradient"
        />
      </div>
    </div>
  );
};
