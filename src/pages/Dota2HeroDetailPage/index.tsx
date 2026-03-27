import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHeroQuery, useHeroesQuery } from '../../queries/useHeroesQuery';
import { heroToSlug } from '../../utils/heroSlug';
import { Loader } from '../../components/Loader';
import { FavoriteButton } from '../../components/FavoriteButton';
import { LazyImage } from '../../components/LazyImage';
import { useSEO } from '../../hooks/useSEO';
import { HeroStats } from './components/HeroStats';
import { AbilitiesSection } from './components/AbilitiesSection';
import { TalentsSection } from './components/TalentsSection';
import type { Dota2Hero, Dota2TalentsEntry } from '../../types/dota2';
import { DOTA2_GAME_ID } from '../Dota2HeroesPage/constants';
import styles from './styles.module.scss';

function Dota2HeroDetailPage() {
  const { t } = useTranslation();
  const { heroSlug } = useParams<{ gameId: string; heroSlug: string }>();
  const navigate = useNavigate();
  const isLegacyId = /^\d+$/.test(heroSlug ?? '');

  const { data: allHeroes = [], isLoading: allHeroesLoading } = useHeroesQuery(DOTA2_GAME_ID);
  const heroFromSlug = !isLegacyId ? allHeroes.find((h) => heroToSlug(h.name) === heroSlug) : undefined;
  const heroId = isLegacyId ? Number(heroSlug) : heroFromSlug?.id;

  const { data: rawHero, isLoading: heroLoading, isError } = useHeroQuery(heroId ?? 0);
  const hero = rawHero as unknown as Dota2Hero | undefined;

  React.useEffect(() => {
    if (isLegacyId && hero) {
      navigate(`/${DOTA2_GAME_ID}/heroes/${heroToSlug(hero.name)}`, { replace: true });
    }
  }, [isLegacyId, hero, navigate]);

  useSEO({
    title: hero ? `${hero.name} — Dota 2 Hero Guide` : 'Dota 2 Hero',
    description: hero ? `${hero.name} Dota 2 guide — skills, stats and abilities.` : undefined,
    image: hero?.image,
  });

  if (heroLoading || (!isLegacyId && allHeroesLoading)) return <Loader />;
  if (isError || (!isLegacyId && !allHeroesLoading && !heroId) || !hero) {
    return <div className={styles.container}><div className={styles.error}>{t('heroDetail.notFound')}</div></div>;
  }

  const abilityshow = (hero.abilityshow ?? []) as any[];
  const abilities = abilityshow.filter((ab) => !ab.is_talents);
  const talentsEntry = abilityshow.find((ab) => ab.is_talents) as Dota2TalentsEntry | undefined;

  return (
    <div className={styles.container}>
      {/* Banner */}
      <div className={styles.banner}>
        {hero.image && (
          <img src={hero.image} alt={hero.name} className={styles.bannerBg} />
        )}
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          {hero.image && (
            <div className={styles.bannerPortrait}>
              <LazyImage src={hero.image} alt={hero.name} fill />
            </div>
          )}
          <div className={styles.bannerInfo}>
            <div className={styles.bannerNameRow}>
              <h1 className={styles.bannerName}>{hero.name}</h1>
              <FavoriteButton heroId={hero.id} />
            </div>
            {hero.roles && hero.roles.length > 0 && (
              <div className={styles.bannerRoles}>
                {hero.roles.map((role) => (
                  <span key={role} className={styles.bannerRole}>{role}</span>
                ))}
              </div>
            )}
            {hero.short_description && (
              <p className={styles.bannerDesc}>{hero.short_description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout: abilities left, stats right */}
      <div className={styles.pageLayout}>
        {/* Left column: Abilities + Talents + Lore */}
        <div className={styles.mainCol}>
          {abilities.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Abilities</h2>
              <AbilitiesSection abilities={abilities} />
            </section>
          )}

          {talentsEntry && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Talents</h2>
              <TalentsSection talents={talentsEntry} />
            </section>
          )}

          {hero.full_description && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Lore</h2>
              <p className={styles.bioText}>{hero.full_description}</p>
            </section>
          )}
        </div>

        {/* Right column: Stats (sticky) */}
        {hero.hero_stats && (
          <div className={styles.sideCol}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Stats</h2>
              <HeroStats hero={hero} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dota2HeroDetailPage;
