import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { useSEO } from '../../hooks/useSEO';
import { getSpellName, getSpellOverview, getSpellDescription } from '../../utils/translation';
import { highlightValues } from '../../utils/highlightValues';
import { sanitizeHtml } from '../../utils/sanitize';
import styles from './styles.module.scss';
import { fetcherRaw } from '../../api/http/fetcher';
import { STALE_5_MIN, queryKeys } from '../../queries/keys';
import type { BattleSpell } from '../../types';

function SpellsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { gameId } = useParams();
  useSEO({ title: 'Battle Spells', description: 'All Mobile Legends battle spells — cooldowns, effects and unlock levels.' });

  const { data: spells = [], isLoading: loading, error: queryError } = useQuery<BattleSpell[]>({
    queryKey: queryKeys.spells.all(Number(gameId)),
    queryFn: () => fetcherRaw<BattleSpell[]>(`/battle-spells?game_id=${gameId}`),
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
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
                  alt={getSpellName(spell, lang)}
                  className={styles.spellIcon}
                />
              )}
              <div className={styles.spellInfo}>
                <h2 className={styles.spellName}>{getSpellName(spell, lang)}</h2>
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

            {(spell.overview || spell.overview_uk) && (
              <p className={styles.spellOverview}>{getSpellOverview(spell, lang)}</p>
            )}

            {(spell.description || spell.description_uk) && (
              <div
                className={styles.spellDescription}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(highlightValues(getSpellDescription(spell, lang))) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpellsPage;
