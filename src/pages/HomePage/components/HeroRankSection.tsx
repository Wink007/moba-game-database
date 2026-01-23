import React from 'react';
import { TopHeroesRanked } from '../../../components/TopHeroesRanked';
import { MoreInfoLink } from '../../../components/MoreInfoLink';
import { HeroRankSectionProps } from './HeroRankSection.interface';
import styles from './HeroRankSection.module.scss';

export const HeroRankSection: React.FC<HeroRankSectionProps> = ({ gameId }) => {
  return (
    <div className={styles.heroRankSection}>
      <TopHeroesRanked />
      <MoreInfoLink linkTo={`${gameId}/hero-ranks`} />
    </div>
  );
};
