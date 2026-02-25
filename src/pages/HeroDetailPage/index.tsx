import { useParams } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getHeroName, getHeroShortDescription, translateRoles, translateLanes, translateSpecialties, getDamageType } from '../../utils/translation';
import { useHeroQuery, useHeroSkillsQuery, useHeroCounterDataQuery, useHeroCompatibilityDataQuery, useHeroesQuery } from '../../queries/useHeroesQuery';
import { usePatchesQuery } from '../../queries/usePatchesQuery';
import { Loader } from '../../components/Loader';
import { FavoriteButton } from '../../components/FavoriteButton';
import { TabsNavigation } from './components/TabsNavigation';
import { SkillsSection } from './components/SkillsSection';
import { InfoTab } from './components/InfoTab';
import { AboutTab } from './components/AboutTab';
import { CounterTab } from './components/CounterTab';
import { SynergyTab } from './components/SynergyTab';
import { HistoryTab } from './components/HistoryTab';
import { BuildsTab } from './components/BuildsTab';
import { useHeroSkills } from './hooks/useHeroSkills';
import { useHeroTabs } from './hooks/useHeroTabs';
import { useSEO } from '../../hooks/useSEO';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useAuthStore } from '../../store/authStore';
import styles from './styles.module.scss';
import type { Patch } from '../../types';

function HeroDetailPage() {
  const { t, i18n } = useTranslation();
  const { heroId } = useParams();
  const { data: hero, isLoading: heroLoading, isError: heroError } = useHeroQuery(Number(heroId));
  const { data: skills = [], isLoading: skillsLoading } = useHeroSkillsQuery(Number(heroId));
  const { data: allHeroes = [] } = useHeroesQuery(hero?.game_id || 0);
  useHeroCounterDataQuery(hero?.game_id || 0);
  useHeroCompatibilityDataQuery(hero?.game_id || 0);
  const { data: patches = [] } = usePatchesQuery();
  
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [bannerLoaded, setBannerLoaded] = React.useState(false);
  
  useEscapeKey(React.useCallback(() => setLightboxOpen(false), []), lightboxOpen);
  
  const { activeTab, counterSubTab, synergySubTab, setActiveTab, setCounterSubTab, setSynergySubTab } = useHeroTabs();
  const [buildsSubTab, setBuildsSubTab] = React.useState<'builds' | 'my'>('builds');
  const { user } = useAuthStore();
  const prevUserRef = React.useRef(user);

  // Reset to 'builds' sub-tab only when user actually logs out (was logged in → becomes null)
  React.useEffect(() => {
    if (prevUserRef.current && !user && buildsSubTab === 'my') {
      setBuildsSubTab('builds');
    }
    prevUserRef.current = user;
  }, [user, buildsSubTab]);
  
  useSEO({
    title: hero ? `${hero.name} — Hero Guide` : 'Hero',
    description: hero ? `${hero.name} guide — skills, builds, counters and stats for Mobile Legends.` : undefined,
  });
  
  const {
    displaySkills,
    selectedSkillIndex,
    selectedSkill,
    maxTransforms,
    transformIndex,
    changedIndices,
    cycleTransform,
    setSelectedSkillIndex,
  } = useHeroSkills(skills);

  // Filter patches containing changes for this hero
  const heroPatches = React.useMemo(() => {
    if (!hero || !patches) return [];
    return patches.filter((patch: Patch) => 
      (patch.hero_changes && patch.hero_changes[hero.name]) ||
      (patch.hero_adjustments && patch.hero_adjustments[hero.name])
    );
  }, [patches, hero]);

  // Ability labels
  const abilitiesLabel = [
    t('heroDetail.durability'),
    t('heroDetail.offense'),
    t('heroDetail.abilityEffects'),
    t('heroDetail.difficulty')
  ];

  // Helper function to get rating level
  const getRatingLevel = (rate: number): { level: string; color: string } => {
    if (rate >= 60) return { level: t('heroDetail.ratingVeryHigh'), color: 'high' };
    if (rate >= 40) return { level: t('heroDetail.ratingHigh'), color: 'medium-high' };
    if (rate >= 20) return { level: t('heroDetail.ratingAverage'), color: 'medium' };
    return { level: t('heroDetail.ratingLow'), color: 'low' };
  };

  if (heroLoading || skillsLoading) return <Loader />;
  if (heroError || !hero) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{t('heroDetail.notFound')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cinematic Banner */}
      <div className={styles.cinematicBanner}>
        {(hero.painting || hero.image) && (
          <img 
            src={hero.painting || hero.image} 
            alt={hero.name}
            className={`${styles.bannerImage} ${bannerLoaded ? styles.bannerImageLoaded : ''}`}
            onLoad={() => setBannerLoaded(true)}
          />
        )}
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerInfoCard}>
            <div className={styles.bannerNameRow}>
              <h1 className={styles.bannerHeroName}>{getHeroName(hero, i18n.language)}</h1>
              <FavoriteButton heroId={hero.id} />
            </div>
            {hero.roles && hero.roles.length > 0 && (
              <div className={styles.bannerRoleTags}>
                {translateRoles(hero.roles, i18n.language).map((role, idx) => (
                  <span key={idx} className={styles.bannerRoleTag}>{role}</span>
                ))}
              </div>
            )}
            {(hero.short_description || hero.short_description_uk) && (
              <p className={styles.bannerDescription}>
                {getHeroShortDescription(hero, i18n.language)}
              </p>
            )}
          </div>
          {hero.image && (
            <div className={styles.bannerPortraitWrapper}>
              {hero.abilityshow && hero.abilityshow.length >= 4 && (
                <svg className={styles.abilityRings} viewBox="0 0 120 120">
                  {/* Durability ring — green */}
                  <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="3" />
                  <circle cx="60" cy="60" r="56" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${(Number(hero.abilityshow[0]) / 100) * 351.86} 351.86`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                  {/* Offense ring — red */}
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="3" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#ef4444" strokeWidth="3"
                    strokeDasharray={`${(Number(hero.abilityshow[1]) / 100) * 326.73} 326.73`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                  {/* Ability Effects ring — blue */}
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(96, 165, 250, 0.15)" strokeWidth="3" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#60a5fa" strokeWidth="3"
                    strokeDasharray={`${(Number(hero.abilityshow[2]) / 100) * 301.59} 301.59`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                  {/* Difficulty ring — amber */}
                  <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="3" />
                  <circle cx="60" cy="60" r="44" fill="none" stroke="#f59e0b" strokeWidth="3"
                    strokeDasharray={`${(Number(hero.abilityshow[3]) / 100) * 276.46} 276.46`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
              )}
              <div className={styles.bannerPortrait} onClick={() => setLightboxOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setLightboxOpen(true)}>
                <img src={hero.image} alt={getHeroName(hero, i18n.language)} />
              </div>
            </div>
          )}
        </div>
        <div className={styles.bannerGradientLine} />
      </div>

      {/* Stats Strip */}
      <div className={styles.statsStrip}>
        <div className={styles.statsStripLeft}>
          {hero.hero_stats?.hp && (
            <div className={styles.statPill} data-type="hp">
              <span className={styles.statPillValue}>{hero.hero_stats.hp}</span>
              <span className={styles.statPillLabel}>HP</span>
              <span className={styles.statPillGrowth}>+{hero.hero_stats?.hp_regen || '0'}</span>
            </div>
          )}
          {!!hero.hero_stats?.mana && (
            <div className={styles.statPill} data-type="mana">
              <span className={styles.statPillValue}>{hero.hero_stats.mana}</span>
              <span className={styles.statPillLabel}>MP</span>
              <span className={styles.statPillGrowth}>+{hero.hero_stats?.mana_regen || '0'}</span>
            </div>
          )}
        </div>
        <div className={styles.statsStripRight}>
          {hero.damage_type && (
            <div className={styles.tagGroup}>
              <span className={styles.tagGroupLabel}>{t('heroDetail.damageType')}</span>
              <span className={styles.tagPill}>{getDamageType(hero.damage_type, i18n.language)}</span>
            </div>
          )}
          {hero.lane && hero.lane.length > 0 && (
            <div className={styles.tagGroup}>
              <span className={styles.tagGroupLabel}>{t('heroDetail.lane')}</span>
              {translateLanes(hero.lane, i18n.language).map((lane, idx) => (
                <span key={`lane-${idx}`} className={styles.tagPill}>{lane}</span>
              ))}
            </div>
          )}
          {hero.specialty && hero.specialty.length > 0 && (
            <div className={styles.tagGroup}>
              <span className={styles.tagGroupLabel}>{t('heroDetail.specialty')}</span>
              {translateSpecialties(hero.specialty, i18n.language).map((spec, idx) => (
                <span key={`spec-${idx}`} className={styles.tagPill} data-accent="true">{spec}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content — full width, no sidebar */}
      <div className={styles.heroMainContent}>
        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'info' && (
              <InfoTab hero={hero} abilitiesLabel={abilitiesLabel} getRatingLevel={getRatingLevel} />
            )}
            {activeTab === 'about' && <AboutTab hero={hero} />}
            {activeTab === 'counter' && (
              <CounterTab hero={hero} allHeroes={allHeroes} counterSubTab={counterSubTab} setCounterSubTab={setCounterSubTab} />
            )}
            {activeTab === 'synergy' && (
              <SynergyTab hero={hero} allHeroes={allHeroes} synergySubTab={synergySubTab} setSynergySubTab={setSynergySubTab} />
            )}
            {activeTab === 'history' && <HistoryTab hero={hero} heroPatches={heroPatches} />}
            {activeTab === 'builds' && (
              <BuildsTab hero={hero} buildsSubTab={buildsSubTab} setBuildsSubTab={setBuildsSubTab} />
            )}
          </div>
        </div>

      {/* Skills Section */}
      <SkillsSection
        displaySkills={displaySkills}
        selectedSkillIndex={selectedSkillIndex}
        selectedSkill={selectedSkill}
        maxTransforms={maxTransforms}
        transformIndex={transformIndex}
        changedIndices={changedIndices}
        onSkillSelect={setSelectedSkillIndex}
        onTransformCycle={cycleTransform}
      />

      {/* Lightbox */}
      {lightboxOpen && (hero.painting || hero.image) && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            className={styles.lightboxImage}
            src={hero.painting || hero.image}
            alt={getHeroName(hero, i18n.language)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default HeroDetailPage;
