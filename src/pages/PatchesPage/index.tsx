import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader';
import { usePatchData } from './hooks/usePatchData';
import { useSEO } from '../../hooks/useSEO';
import { sanitizeHtml } from '../../utils/sanitize';
import type { HeroAdjustment, EquipmentAdjustment, BattlefieldAdjustment, SkillAdjustment } from './types';
import styles from './styles.module.scss';

// ─── Badge helpers ─────────────────────────────────────────────────

const badgeClass = (badge: string, s: typeof styles) => {
  switch (badge.toUpperCase()) {
    case 'BUFF':   return s.buff;
    case 'nerf':
    case 'NERF':   return s.nerf;
    case 'ADJUST': return s.adjust;
    case 'CHANGE':
    case 'REVAMP': return s.revamp;
    default:       return '';
  }
};

interface BadgeProps { badge: string }
const Badge: React.FC<BadgeProps> = ({ badge }) => {
  const { t } = useTranslation();
  const labelMap: Record<string, string> = {
    BUFF: t('patches.buffs'),
    NERF: t('patches.nerfs'),
    ADJUST: t('patches.adjustments'),
    CHANGE: t('patches.adjustments'),
    REVAMP: t('patches.rework'),
  };
  const label = labelMap[badge.toUpperCase()] ?? badge;
  return (
    <span className={`${styles.badge} ${badgeClass(badge, styles)}`}>
      {label}
    </span>
  );
};

// ─── Skill block ───────────────────────────────────────────────────

interface SkillBlockProps { skill: SkillAdjustment }
const SkillBlock: React.FC<SkillBlockProps> = ({ skill }) => (
  <div className={styles.skillBlock}>
    <div className={styles.skillHeader}>
      <span className={styles.skillName}>{skill.skill_name}</span>
      <Badge badge={skill.badge} />
    </div>
    {skill.description && (
      <p className={styles.summary}
         dangerouslySetInnerHTML={{ __html: sanitizeHtml(skill.description) }} />
    )}
  </div>
);

// ─── Hero card ─────────────────────────────────────────────────────

interface HeroCardProps {
  name: string;
  data: HeroAdjustment;
  heroId?: number;
  gameId?: string;
  isRevamped?: boolean;
}
const HeroCard: React.FC<HeroCardProps> = ({ name, data, heroId, gameId, isRevamped }) => (
  <div
    id={name}
    className={isRevamped ? styles.revampedHeroCard : styles.heroCard}
    style={isRevamped ? { scrollMarginTop: 80 } : undefined}
  >
    <div className={styles.heroHeader}>
      {heroId ? (
        <Link to={`/${gameId}/heroes/${heroId}`} className={styles.heroLink}>
          <h3>{name}</h3>
        </Link>
      ) : (
        <h3>{name}</h3>
      )}
      <Badge badge={isRevamped ? 'REVAMP' : data.badge} />
    </div>

    {data.description && (
      <p className={styles.summary}
         dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.description) }} />
    )}

    {data.adjustments?.map((skill, i) => (
      <SkillBlock key={i} skill={skill} />
    ))}
  </div>
);

// ─── Equipment card ────────────────────────────────────────────────

interface ItemCardProps {
  name: string;
  data: EquipmentAdjustment;
  itemId?: number;
  gameId?: string;
}
const ItemCard: React.FC<ItemCardProps> = ({ name, data, itemId, gameId }) => (
  <div className={styles.itemCard}>
    <div className={styles.itemHeader}>
      {itemId ? (
        <Link to={`/${gameId}/items?item=${itemId}`} className={styles.heroLink}>
          <h4>{name}</h4>
        </Link>
      ) : (
        <h4>{name}</h4>
      )}
      <Badge badge={data.badge} />
    </div>

    {data.description && (
      <p className={styles.summary}
         dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.description) }} />
    )}

    {data.adjustments?.map((skill, i) => (
      <SkillBlock key={i} skill={skill} />
    ))}
  </div>
);

// ─── Battlefield card ──────────────────────────────────────────────

interface BattlefieldCardProps { name: string; data: BattlefieldAdjustment }
const BattlefieldCard: React.FC<BattlefieldCardProps> = ({ name, data }) => (
  <div className={styles.itemCard}>
    <div className={styles.itemHeader}>
      <h4>{name}</h4>
      <Badge badge={data.badge} />
    </div>
    {data.description && (
      <p className={styles.summary}
         dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.description) }} />
    )}
  </div>
);

// ─── PatchesPage ───────────────────────────────────────────────────

export const PatchesPage: React.FC = () => {
  const { t } = useTranslation();
  const { gameId, patchVersion } = useParams<{ gameId: string; patchVersion?: string }>();

  useSEO({
    title: patchVersion ? `Patch ${patchVersion}` : 'Patch Notes',
    description: 'Mobile Legends patch notes — hero buffs, nerfs, item changes and more.',
  });

  const {
    patchVersions,
    currentPatchData,
    loading,
    loadingPatch,
    selectedPatch,
    heroNameToId,
    itemNameToId,
    handlePatchSelect,
  } = usePatchData({ gameId, patchVersion });

  // Scroll to anchor after load
  useEffect(() => {
    if (!loading && selectedPatch) {
      setTimeout(() => {
        const hash = window.location.hash.slice(1);
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [loading, selectedPatch]);

  if (loading) return <Loader />;

  const patch = currentPatchData;
  const revampedSet = new Set(patch?.revamped_heroes ?? []);

  const revampedEntries = patch
    ? Object.entries(patch.hero_adjustments).filter(([n]) => revampedSet.has(n))
    : [];

  const heroEntries = patch
    ? Object.entries(patch.hero_adjustments).filter(([n]) => !revampedSet.has(n))
    : [];

  const equipEntries  = patch ? Object.entries(patch.equipment_adjustments)  : [];
  const bfEntries     = patch ? Object.entries(patch.battlefield_adjustments) : [];
  const sysEntries    = patch?.system_adjustments ?? [];

  const redditUrl = patch?.reddit_permalink
    ? `https://www.reddit.com${patch.reddit_permalink}`
    : null;

  return (
    <div className={styles.patchesPage}>
      {/* Sidebar: patch selector */}
      <div className={styles.patchSelector}>
        <div className={styles.patchVersions}>
          {patchVersions.map(p => (
            <button
              key={p.version}
              className={`${styles.patchButton} ${selectedPatch === p.version ? styles.active : ''}`}
              onClick={() => handlePatchSelect(p.version)}
            >
              {p.version}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {loadingPatch ? (
          <Loader />
        ) : patch ? (
          <>
            {/* Header */}
            <div className={styles.patchHeader}>
              <h1>
                {t('patches.version')} {patch.version}
                {patch.is_adv_server && (
                  <span style={{ fontSize: '0.55em', marginLeft: 12, opacity: 0.55, fontWeight: 400 }}>
                    ADV SERVER
                  </span>
                )}
              </h1>
              <p className={styles.releaseDate}>{patch.release_date}</p>
              {redditUrl && (
                <a
                  href={redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  reddit.com ↗
                </a>
              )}
            </div>

            {/* Revamped Heroes */}
            {revampedEntries.length > 0 && (
              <div className={styles.section}>
                <h2>{t('patches.revampedHeroes')}</h2>
                {revampedEntries.map(([name, data]) => (
                  <HeroCard
                    key={name}
                    name={name}
                    data={data}
                    heroId={heroNameToId[name]}
                    gameId={gameId}
                    isRevamped
                  />
                ))}
              </div>
            )}

            {/* Hero Adjustments */}
            {heroEntries.length > 0 && (
              <div className={styles.section}>
                <h2>{t('patches.heroChanges')}</h2>
                {heroEntries.map(([name, data]) => (
                  <HeroCard
                    key={name}
                    name={name}
                    data={data}
                    heroId={heroNameToId[name]}
                    gameId={gameId}
                  />
                ))}
              </div>
            )}

            {/* Equipment Adjustments */}
            {equipEntries.length > 0 && (
              <div className={styles.section}>
                <h2>{t('patches.itemChanges')}</h2>
                {equipEntries.map(([name, data]) => (
                  <ItemCard
                    key={name}
                    name={name}
                    data={data}
                    itemId={itemNameToId[name]}
                    gameId={gameId}
                  />
                ))}
              </div>
            )}

            {/* Battlefield Adjustments */}
            {bfEntries.length > 0 && (
              <div className={styles.section}>
                <h2>{t('patches.battlefieldChanges')}</h2>
                {bfEntries.map(([name, data]) => (
                  <BattlefieldCard key={name} name={name} data={data} />
                ))}
              </div>
            )}

            {/* System / Mode Adjustments */}
            {sysEntries.length > 0 && (
              <div className={styles.section}>
                <h2>{t('patches.systemChanges')}</h2>
                <ul className={styles.systemChanges}>
                  {sysEntries.map((text, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
