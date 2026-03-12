import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLatestHeroesQuery } from '../../../queries/useHeroesQuery';
import { heroToSlug } from '../../../utils/heroSlug';
import styles from '../styles.module.scss';

export const NewHeroStrip = ({ gameId }: { gameId: number }) => {
  const { t } = useTranslation();
  const { data: latestHeroes } = useLatestHeroesQuery(gameId, 1);
  const hero = latestHeroes?.[0];
  if (!hero) return null;

  return (
    <Link to={`/${gameId}/heroes/${heroToSlug(hero.name)}`} className={styles.newHeroStrip}>
      <span className={styles.stripDot} />
      <span className={styles.stripLabel}>{t('patches.newHero')}</span>
      <span className={styles.stripName}>{hero.name}</span>
      <svg className={styles.stripArrow} width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
};
