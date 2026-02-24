import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useEmblems, useEmblemTalents } from '../../hooks/useEmblems';
import { EmblemCard } from './components/EmblemCard';
import { TalentsSection } from './components/TalentsSection';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

function EmblemsPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  useSEO({ title: 'Emblems', description: 'All Mobile Legends emblems and talents — find the best emblem setup for your hero.' });

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
    return <div className={styles.noData}>{t('emblems.noData')}</div>;
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
        <>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelText}>{t('emblems.title')}</span>
          </div>
          <div className={styles.emblemsGrid}>
            {emblems.map((emblem) => (
              <EmblemCard key={emblem.id} emblem={emblem} />
            ))}
          </div>
        </>
      )}

      {(tier1.length > 0 || tier2.length > 0 || tier3.length > 0) && (
        <div className={styles.talentsDivider}>
          <span className={styles.talentsDividerText}>{t('emblems.talents')}</span>
        </div>
      )}

      {tier1.length > 0 && (
        <TalentsSection title={`${t('emblems.tier')} 1 — ${t('emblems.talents')}`} talents={tier1} tier={1} />
      )}

      {tier2.length > 0 && (
        <TalentsSection title={`${t('emblems.tier')} 2 — ${t('emblems.talents')}`} talents={tier2} tier={2} />
      )}

      {tier3.length > 0 && (
        <TalentsSection title={`${t('emblems.tier')} 3 — ${t('emblems.talents')}`} talents={tier3} tier={3} />
      )}
    </div>
  );
}

export default EmblemsPage;
