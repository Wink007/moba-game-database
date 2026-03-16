import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getHeroName } from '../../utils/translation';
import { heroToSlug } from '../../utils/heroSlug';
import { useHeroRanksQuery } from '../../queries/useHeroesQuery';
import { useGameStore } from '../../store/gameStore';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { getRankOptions } from '../../pages/HeroRankPage/constants';
import { LazyImage } from '../LazyImage';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import s from './styles.module.scss';

/* ── tier helpers ── */
const TIER_CLS  = ['', s.gold, s.silver, s.bronze];
const TIER_ICON = ['', '👑', '', ''];

/* ── Skeleton ── */
const Bone = ({ cls, delay }: { cls: string; delay?: number }) => (
  <div
    className={`${s.bone} ${cls}`}
    style={delay ? { animationDelay: `${delay}ms` } : undefined}
  />
);

const SkeletonCard = ({ i }: { i: number }) => (
  <div className={s.card} style={{ '--enter-d': `${i * 90}ms` } as React.CSSProperties}>
    <div className={s.cardLeft}>
      <Bone cls={s.boneRank} delay={i * 70} />
      <Bone cls={s.boneAvatar} delay={i * 70 + 35} />
      <Bone cls={s.boneName} delay={i * 70 + 70} />
    </div>
    <div className={s.cardRight}>
      <Bone cls={s.bonePill} delay={i * 70 + 100} />
      <Bone cls={s.bonePill} delay={i * 70 + 130} />
      <Bone cls={s.bonePill} delay={i * 70 + 160} />
    </div>
  </div>
);

/* ── Stat pill ── */
const Pill = ({ value, label, type }: { value: number; label: string; type: string }) => (
  <div className={`${s.pill} ${s[`pill_${type}`]}`}>
    <span className={s.pillLabel}>{label}</span>
    <span className={s.pillValue}>{value.toFixed(2)}%</span>
  </div>
);

/* ── Main ── */
export const TopHeroesRanked = () => {
  const { t, i18n } = useTranslation();
  const { selectedGameId } = useGameStore();
  const { defaultDays, defaultRank } = useFilterSettingsStore();

  const rankLabel = useMemo(() => {
    const opts = getRankOptions(t);
    return opts.find(o => o.value === defaultRank)?.label ?? defaultRank;
  }, [defaultRank, t]);

  const { data: heroRanks, isLoading, isError } = useHeroRanksQuery(
    selectedGameId, 1, 5, defaultDays, defaultRank, 'win_rate', 'desc'
  );

  if (!selectedGameId) return null;
  if (isError) return <div className={s.error}>{t('heroRank.noData')}</div>;

  return (
    <div className={s.wrap}>
      {/* Header bar */}
      <div className={s.header}>
        <h4 className={s.title}>{t('home.topHeroesRanking')}</h4>
        <span className={s.meta}>
          {t('home.lastDays', { days: defaultDays, rank: rankLabel })}
          {!isLoading && heroRanks?.[0] && (
            <> · {t('home.updatedTime', { time: heroRanks[0].updated_at })}</>
          )}
        </span>
      </div>

      {/* Cards */}
      <div className={s.list}>
        {isLoading
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} i={i} />)
          : heroRanks?.map((hero, i) => (
              <Link
                key={hero.id}
                to={`${selectedGameId}/heroes/${heroToSlug(hero.name)}`}
                className={`${s.card} ${TIER_CLS[i < 3 ? i + 1 : 0]}`}
                style={{ '--enter-d': `${i * 90}ms` } as React.CSSProperties}
              >
                {/* Left: rank + avatar + name */}
                <div className={s.cardLeft}>
                  <div className={`${s.rank} ${TIER_CLS[i < 3 ? i + 1 : 0]}`}>
                    {TIER_ICON[i + 1] || <span>{i + 1}</span>}
                  </div>

                  <div className={`${s.avatarWrap} ${TIER_CLS[i < 3 ? i + 1 : 0]}`}>
                    <LazyImage
                      fill
                      className={s.avatarImg}
                      src={getOptimizedImageUrl(hero.head || hero.image, 80)}
                      alt={getHeroName(hero, i18n.language)}
                      priority={i < 5}
                      loading="eager"
                      width={54}
                      height={54}
                    />
                  </div>

                  <span className={s.name}>{getHeroName(hero, i18n.language)}</span>
                </div>

                {/* Right: stat pills */}
                <div className={s.cardRight}>
                  <Pill value={hero.win_rate} label={t('heroRank.winRate')} type="win" />
                  <Pill value={hero.appearance_rate} label={t('heroRank.pickRate')} type="pick" />
                  <Pill value={hero.ban_rate} label={t('heroRank.banRate')} type="ban" />
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
};
