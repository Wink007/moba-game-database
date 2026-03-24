import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { heroToSlug } from '../../../utils/heroSlug';
import { MainHeroSelector } from '../../../components/MainHeroSelector';
import type { ProfileBodyProps } from '../types';
import type { Item } from '../../../types';
import styles from '../styles.module.scss';

export const ProfileBody: React.FC<ProfileBodyProps> = ({
  isOwnProfile,
  user,
  mainHeroes,
  builds,
  favorites,
  favoritesCount,
  itemsMap,
  selectedGameId,
  onOpenMlbb,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.body}>
      {isOwnProfile && <MainHeroSelector />}

      {isOwnProfile && !user.mlbb_role_id && !user.mlbb_nickname && (
        <div className={styles.mlbbPromo} onClick={onOpenMlbb}>
          <img
            src="/mlbb-icon.png"
            alt="MLBB"
            className={styles.mlbbPromoIcon}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className={styles.mlbbPromoText}>
            <span className={styles.mlbbPromoTitle}>{t('profile.mlbbLinkBtn')}</span>
            <span className={styles.mlbbPromoSub}>{t('profile.mlbbHeroStats')}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {!isOwnProfile && mainHeroes.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('profile.mainHeroes')}</h2>
            <span className={styles.sectionCount}>{mainHeroes.length}</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.heroesGrid}>
              {mainHeroes.map(h => (
                <Link key={h.hero_id} to={`/${h.game_id || 2}/heroes/${heroToSlug(h.name)}`} className={styles.heroCard}>
                  <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                  <span>{h.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {builds.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('profile.publicBuilds')}</h2>
            <span className={styles.sectionCount}>{builds.length}</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.buildsList}>
              {builds.map(b => {
                const score = (b.upvotes || 0) - (b.downvotes || 0);
                const buildItems = (b.items || []).map((id: number) => itemsMap.get(id)).filter(Boolean) as Item[];
                return (
                  <div key={b.id} className={styles.buildItem}>
                    <Link to={`/2/heroes/${heroToSlug(b.hero_name)}?tab=builds`} className={styles.buildLink}>
                      {b.hero_head && (
                        <img src={b.hero_head} alt={b.hero_name} className={styles.buildHeroImg} loading="lazy" />
                      )}
                      <div className={styles.buildMeta}>
                        <span className={styles.buildName}>{b.name}</span>
                        <span className={styles.buildHeroName}>{b.hero_name}</span>
                        {b.created_at && (
                          <span className={styles.buildDate}>{new Date(b.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className={styles.buildItemIcons}>
                        {buildItems.slice(0, 6).map((item, idx) =>
                          item?.icon_url ? (
                            <img key={idx} src={item.icon_url} alt={item.name} title={item.name} loading="lazy" />
                          ) : null
                        )}
                      </div>
                    </Link>
                    <div className={`${styles.buildScore} ${score > 0 ? styles.positive : score < 0 ? styles.negative : ''}`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z" />
                      </svg>
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('profile.favoriteHeroes')}</h2>
            <span className={styles.sectionCount}>{favorites.length}</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.heroesGrid}>
              {favorites.map(h => (
                <Link key={h.id} to={`/${h.game_id || 2}/heroes/${heroToSlug(h.name)}`} className={styles.heroCard}>
                  <img src={h.head || h.image || ''} alt={h.name} loading="lazy" />
                  <span>{h.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {builds.length === 0 && favorites.length === 0 && mainHeroes.length === 0 && (
        <div className={styles.empty}>
          <svg className={styles.emptyIcon} width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          <p>{t('profile.empty')}</p>
          <div className={styles.emptyActions}>
            <Link to={`/${selectedGameId}/heroes`} className={styles.emptyLink}>
              {t('profile.exploreHeroes', 'Explore Heroes')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
