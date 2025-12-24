import styles from '../styles.module.scss';

interface HeroRankSkeletonProps {
  count?: number;
}

export const HeroRankSkeleton = ({ count = 20 }: HeroRankSkeletonProps) => (
  <>
    {[...Array(count)].map((_, index) => (
      <div key={index} className={styles.heroCardSkeleton} />
    ))}
  </>
);
