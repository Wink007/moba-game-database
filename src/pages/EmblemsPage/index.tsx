import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useEmblems, useEmblemTalents } from '../../hooks/useEmblems';
import { EmblemCard } from './components/EmblemCard';
import { TalentsSection } from './components/TalentsSection';
import styles from './styles.module.scss';

function EmblemsPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();

  const { data: emblems = [], isLoading: emblemsLoading, error: emblemsError } = useEmblems(gameId);
  const { tier1, tier2, tier3, isLoading: talentsLoading } = useEmblemTalents(gameId);

  const loading = emblemsLoading || talentsLoading;
  const error = emblemsError ? t('emblems.failedToLoad') : null;

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (emblems.length === 0 && tier1.length === 0 && tier2.length === 0 && tier3.length === 0) {
    return <div className={styles.noData}>No emblems data available</div>;
  }

  return (
    <div className={styles.emblemsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('emblems.title')}</h1>
        <p className={styles.description}>
          {t('emblems.description')}
        </p>
      </div>

      {emblems.length > 0 && (
        <div className={styles.emblemsGrid}>
          {emblems.map((emblem) => (
            <EmblemCard key={emblem.id} emblem={emblem} />
          ))}
        </div>
      )}

      {tier1.length > 0 && (
        <TalentsSection title="Tier 1 Talents" talents={tier1} tier={1} />
      )}

      {tier2.length > 0 && (
        <TalentsSection title="Tier 2 Talents" talents={tier2} tier={2} />
      )}

      {tier3.length > 0 && (
        <TalentsSection title="Tier 3 Talents" talents={tier3} tier={3} />
      )}
    </div>
  );
}

export default EmblemsPage;
