import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MlbbHeroCardProps } from '../types';
import styles from '../styles.module.scss';

export const MlbbHeroCard: React.FC<MlbbHeroCardProps> = ({ stat, hero, isExpanded, onToggle }) => {
  const { t } = useTranslation();
  const wrColor = stat.win_rate >= 55 ? '#22c55e' : stat.win_rate >= 50 ? '#86efac' : stat.win_rate >= 45 ? '#fbbf24' : '#ef4444';

  return (
    <div className={`${styles.mlbbCard} ${isExpanded ? styles.mlbbCardOpen : ''}`}>

      {/* Collapsed row */}
      <div className={styles.mlbbCardRow} onClick={onToggle}>
        <div className={styles.mlbbCardHero}>
          {hero?.head
            ? <img src={hero.head} alt={hero.name} className={styles.mlbbCardImg} />
            : <div className={styles.mlbbCardImgPlaceholder} />}
          <span className={styles.mlbbCardName}>{hero?.name ?? `#${stat.hero_id}`}</span>
        </div>
        <div className={styles.mlbbCardStats}>
          <div className={styles.mlbbCardStat}>
            <span className={styles.mlbbCardStatVal}>{stat.total_games}</span>
            <span className={styles.mlbbCardStatLbl}>{t('profile.mlbbGames')}</span>
          </div>
          <div className={styles.mlbbCardStat}>
            <span className={styles.mlbbCardStatVal} style={{ color: wrColor }}>{stat.win_rate}%</span>
            <span className={styles.mlbbCardStatLbl}>{t('profile.mlbbWinRate')}</span>
          </div>
          <div className={styles.mlbbCardStat}>
            <span className={styles.mlbbCardStatVal}>{stat.kda.toFixed(2)}</span>
            <span className={styles.mlbbCardStatLbl}>{t('profile.mlbbKDA')}</span>
          </div>
        </div>
        <span className={`${styles.mlbbCardChevron} ${isExpanded ? styles.mlbbCardChevronOpen : ''}`}>›</span>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className={styles.mlbbCardDetail}>

          {/* Avg K/D/A */}
          <div className={styles.mlbbCardKda}>
            <div className={styles.mlbbCardKdaItem}>
              <span className={styles.mlbbCardKdaNum} style={{ color: '#86efac' }}>{stat.avg_kills}</span>
              <span className={styles.mlbbCardKdaLbl}>{t('profile.mlbbAvgKills')}</span>
            </div>
            <div className={styles.mlbbCardKdaSep}>/</div>
            <div className={styles.mlbbCardKdaItem}>
              <span className={styles.mlbbCardKdaNum} style={{ color: '#f87171' }}>{stat.avg_deaths}</span>
              <span className={styles.mlbbCardKdaLbl}>{t('profile.mlbbAvgDeaths')}</span>
            </div>
            <div className={styles.mlbbCardKdaSep}>/</div>
            <div className={styles.mlbbCardKdaItem}>
              <span className={styles.mlbbCardKdaNum} style={{ color: '#93c5fd' }}>{stat.avg_assists}</span>
              <span className={styles.mlbbCardKdaLbl}>{t('profile.mlbbAvgAssists')}</span>
            </div>
          </div>

          {/* Stat grid */}
          <div className={styles.mlbbCardGrid}>
            <div className={styles.mlbbCardGridItem}>
              <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbDamageDealt')}</span>
              <span className={styles.mlbbCardGridVal}>{stat.avg_damage > 0 ? (stat.avg_damage / 100).toFixed(1) + 'k' : '—'}</span>
              <span className={styles.mlbbCardGridSub}>{t('profile.mlbbAvgPerGame')}</span>
            </div>
            <div className={styles.mlbbCardGridItem}>
              <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbDamageTaken')}</span>
              <span className={styles.mlbbCardGridVal}>{stat.avg_taken > 0 ? (stat.avg_taken / 100).toFixed(1) + 'k' : '—'}</span>
              <span className={styles.mlbbCardGridSub}>{t('profile.mlbbAvgPerGame')}</span>
            </div>
            <div className={styles.mlbbCardGridItem}>
              <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbBestKDA')}</span>
              <span className={styles.mlbbCardGridVal}>{stat.max_kda.toFixed(2)}</span>
              <span className={styles.mlbbCardGridSub}>{t('profile.mlbbPersonalRecord')}</span>
            </div>
            <div className={styles.mlbbCardGridItem}>
              <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbMostKills')}</span>
              <span className={styles.mlbbCardGridVal}>{stat.max_kills}</span>
              <span className={styles.mlbbCardGridSub}>{t('profile.mlbbPersonalRecord')}</span>
            </div>
            <div className={styles.mlbbCardGridItem}>
              <span className={styles.mlbbCardGridLbl}>{t('profile.mlbbMVP')}</span>
              <span className={styles.mlbbCardGridVal}>{stat.mvp}</span>
              <span className={styles.mlbbCardGridSub}>{t('profile.mlbbMVPSub')}</span>
            </div>
          </div>

          {/* Multikills */}
          {(stat.penta_kills > 0 || stat.quadra_kills > 0 || stat.triple_kills > 0) && (
            <div className={styles.mlbbCardMulti}>
              {stat.penta_kills > 0 && <span className={styles.mlbbBadgePenta}><span>{t('profile.mlbbPentaKill')}</span><span>×{stat.penta_kills}</span></span>}
              {stat.quadra_kills > 0 && <span className={styles.mlbbBadgePurple}><span>{t('profile.mlbbQuadraKill')}</span><span>×{stat.quadra_kills}</span></span>}
              {stat.triple_kills > 0 && <span className={styles.mlbbBadgeBlue}><span>{t('profile.mlbbTripleKill')}</span><span>×{stat.triple_kills}</span></span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
