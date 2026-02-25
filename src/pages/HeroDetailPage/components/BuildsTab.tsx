import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProBuildsSection } from './ProBuildsSection';
import { CommunityBuildsSection } from './CommunityBuildsSection';
import { BuildsTabProps } from './interface';
import styles from '../styles.module.scss';

export const BuildsTab: React.FC<BuildsTabProps> = React.memo(({ hero, buildsSubTab, setBuildsSubTab }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.contentSection}>
      <div className={styles.relationshipTabs}>
        <button
          className={`${styles.relationshipTab} ${buildsSubTab === 'builds' ? styles.relationshipTabActive : ''}`}
          onClick={() => setBuildsSubTab('builds')}
        >
          {t('heroDetail.proBuilds')}
        </button>
        <button
          className={`${styles.relationshipTab} ${buildsSubTab === 'my' ? styles.relationshipTabActive : ''}`}
          onClick={() => setBuildsSubTab('my')}
        >
          {t('builds.myBuilds')}
        </button>
      </div>

      {buildsSubTab === 'builds' && (
        <>
          <ProBuildsSection builds={hero.pro_builds || []} gameId={hero.game_id} />
          <CommunityBuildsSection heroId={hero.id} gameId={hero.game_id} showOnly="community" />
        </>
      )}

      {buildsSubTab === 'my' && (
        <CommunityBuildsSection heroId={hero.id} gameId={hero.game_id} showOnly="my" />
      )}
    </div>
  );
});
