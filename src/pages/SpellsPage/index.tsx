import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';
import { API_URL } from '../../config';

interface BattleSpell {
  id: number;
  game_id: number;
  name: string;
  overview?: string;
  description?: string;
  cooldown?: number;
  unlocked_level?: number;
  icon_url?: string;
}

function SpellsPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  useSEO({ title: 'Battle Spells', description: 'All Mobile Legends battle spells — cooldowns, effects and unlock levels.' });

  const { data: spells = [], isLoading: loading, error: queryError } = useQuery<BattleSpell[]>({
    queryKey: ['battle-spells', gameId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/battle-spells?game_id=${gameId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch battle spells from API');
      }
      return response.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 хвилин
  });

  const error = queryError ? t('spells.failedToLoad') : null;

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (spells.length === 0) {
    return <div className={styles.noData}>{t('spells.noSpells')}</div>;
  }

  return (
    <div className={styles.spellsPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('spells.title')}</h1>
        <p className={styles.description}>
          {t('spells.description')}
        </p>
      </div>

      {/* Spells Grid */}
      <div className={styles.spellsGrid}>
        {spells.map((spell) => (
          <div key={spell.id} className={styles.spellCard}>
            <div className={styles.spellHeader}>
              {spell.icon_url && (
                <img
                  src={spell.icon_url}
                  alt={spell.name}
                  className={styles.spellIcon}
                />
              )}
              <div className={styles.spellInfo}>
                <h2 className={styles.spellName}>{spell.name}</h2>
                <div className={styles.spellMeta}>
                  {spell.cooldown !== undefined && spell.cooldown !== null && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>{t('spells.cooldown')}:</span>
                      <span className={styles.metaValue}>{spell.cooldown}s</span>
                    </div>
                  )}
                  {spell.unlocked_level !== undefined && spell.unlocked_level !== null && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>{t('spells.unlock')}:</span>
                      <span className={styles.metaValue}>{t('spells.level')} {spell.unlocked_level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {spell.overview && (
              <p className={styles.spellOverview}>{spell.overview}</p>
            )}

            {spell.description && (
              <div className={styles.spellDescription}>{spell.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpellsPage;
