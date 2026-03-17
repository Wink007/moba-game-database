import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { heroToSlug } from '../../utils/heroSlug';
import { getHeroName } from '../../utils/translation';
import { LazyImage } from '../LazyImage';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import { useMetaReport, MetaHero } from './useMetaReport';
import styles from './styles.module.scss';

const HeroRow = ({ item, rank, mode }: { item: MetaHero; rank: number; mode: 'rising' | 'falling' }) => {
  const { i18n } = useTranslation();
  const { selectedGameId } = useGameStore();
  const slug = heroToSlug(item.hero.name);
  const name = getHeroName(item.hero as any, i18n.language);
  const isRising = mode === 'rising';

  return (
    <Link to={`/${selectedGameId}/heroes/${slug}`} className={styles.heroRow}>
      <span className={styles.rank}>{rank}</span>
      <div className={styles.avatar}>
        {item.hero.head
          ? <LazyImage src={getOptimizedImageUrl(item.hero.head, 80)} alt={name} className={styles.avatarImg} />
          : <div className={styles.avatarPlaceholder}>{name[0]}</div>
        }
      </div>
      <div className={styles.heroMeta}>
        <span className={styles.heroName}>{name}</span>
        {item.hero.roles && item.hero.roles.length > 0 && (
          <span className={styles.heroRole}>{item.hero.roles[0]}</span>
        )}
      </div>
      <div className={styles.heroStats}>
        <span className={styles.winRate}>{item.winRate.toFixed(1)}%</span>
        <span className={`${styles.delta} ${isRising ? styles.deltaUp : styles.deltaDown}`}>
          {isRising ? '▲' : '▼'} {Math.abs(item.delta).toFixed(2)}%
        </span>
      </div>
    </Link>
  );
};

const SkeletonRow = () => (
  <div className={styles.heroRow} style={{ pointerEvents: 'none' }}>
    <span className={`${styles.rank} ${styles.skeletonShimmer}`} style={{ width: 16, height: 16, borderRadius: 4 }} />
    <div className={styles.avatar}>
      <div className={`${styles.avatarPlaceholder} ${styles.skeletonShimmer}`} />
    </div>
    <div className={styles.heroMeta}>
      <div className={`${styles.skeletonShimmer}`} style={{ width: 80, height: 12, borderRadius: 4 }} />
      <div className={`${styles.skeletonShimmer}`} style={{ width: 50, height: 10, borderRadius: 4, marginTop: 4 }} />
    </div>
    <div className={styles.heroStats} style={{ gap: 4 }}>
      <div className={`${styles.skeletonShimmer}`} style={{ width: 44, height: 12, borderRadius: 4 }} />
      <div className={`${styles.skeletonShimmer}`} style={{ width: 52, height: 18, borderRadius: 6 }} />
    </div>
  </div>
);

export const MetaReport = () => {
  const { t, i18n } = useTranslation();
  const { selectedGameId } = useGameStore();
  const { isLoading, isError, rising, falling, topBanned } = useMetaReport(selectedGameId);

  if (isError) return (
    <div className={styles.wrapper}>
      <div className={styles.errorState}>{t('common.error')}</div>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.pulse} />
          <span className={styles.title}>{t('metaReport.title')}</span>
        </div>
        <span className={styles.subtitle}>{t('metaReport.subtitle')}</span>
      </div>

      <div className={styles.columns}>
        {/* Rising */}
        <div className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.columnHeaderRising}`}>
            <span className={styles.columnIcon}>▲</span>
            <span>{t('metaReport.rising')}</span>
          </div>
          <div className={styles.rows}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : rising.map((item, i) => (
                  <HeroRow key={item.hero.hero_id} item={item} rank={i + 1} mode="rising" />
                ))
            }
          </div>
        </div>

        {/* Falling */}
        <div className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.columnHeaderFalling}`}>
            <span className={styles.columnIcon}>▼</span>
            <span>{t('metaReport.falling')}</span>
          </div>
          <div className={styles.rows}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : falling.map((item, i) => (
                  <HeroRow key={item.hero.hero_id} item={item} rank={i + 1} mode="falling" />
                ))
            }
          </div>
        </div>
      </div>

      {/* Most Banned */}
      <div className={styles.bannedSection}>
        <span className={styles.bannedLabel}>{t('metaReport.mostBanned')}</span>
        <div className={styles.bannedGrid}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.bannedPortrait} style={{ pointerEvents: 'none' }}>
                  <div className={styles.bannedAvatarWrap}>
                    <div className={`${styles.bannedPortraitAvatar} ${styles.skeletonShimmer}`} />
                  </div>
                  <div className={`${styles.skeletonShimmer}`} style={{ width: 48, height: 10, borderRadius: 4 }} />
                  <div className={`${styles.skeletonShimmer}`} style={{ width: 32, height: 10, borderRadius: 4 }} />
                </div>
              ))
            : topBanned.slice(0, 5).map((item, i) => {
                const name = getHeroName(item.hero as any, i18n.language);
                const slug = heroToSlug(item.hero.name);
                const rankCls = i === 0 ? styles.rankGold : i === 1 ? styles.rankSilver : i === 2 ? styles.rankBronze : '';
                return (
                  <Link key={item.hero.hero_id} to={`/${selectedGameId}/heroes/${slug}`}
                    className={`${styles.bannedPortrait} ${rankCls}`}
                  >
                    <div className={styles.bannedAvatarWrap}>
                      {item.hero.head
                        ? <LazyImage src={getOptimizedImageUrl(item.hero.head, 80)} alt={name} className={styles.bannedPortraitAvatar} />
                        : <div className={`${styles.bannedPortraitAvatar} ${styles.avatarPlaceholder}`}>{name[0]}</div>
                      }
                    </div>
                    <span className={styles.bannedPortraitName}>{name}</span>
                    <span className={styles.bannedPortraitRate}>{item.banRate.toFixed(1)}%</span>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </div>
  );
};
