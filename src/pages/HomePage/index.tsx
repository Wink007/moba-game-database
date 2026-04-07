import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useGamesQuery } from '../../queries/useGamesQuery';
import { useGameStore } from '../../store/gameStore';
import { LastHeroesInfo } from '../../components/LastHeroesInfo';
import { MetaReport } from '../../components/MetaReport';
import { NewsWidget } from './components/NewsWidget';
import { VideoPreview } from './components/VideoPreview';
import { HeroRankSection } from './components/HeroRankSection';
import { NewHeroStrip } from './components/NewHeroStrip';
import { MatchesWidget } from './components/MatchesWidget';
import { RecentActivityWidget } from './components/RecentActivityWidget';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

export const HomePage = () => {
  const { t } = useTranslation();
  const { data: games, isError } = useGamesQuery();
  const { selectedGameId, cachedVideoIntro, cachedPreview, cachedSubtitle, setCachedGame } = useGameStore();
  const defaultGame = games?.find(g => g.id === selectedGameId);

  const videoThumbnailUrl = defaultGame?.video_intro?.includes('cloudinary.com')
    ? defaultGame.video_intro
        .replace('/video/upload/', '/video/upload/so_0,w_1280,q_auto/')
        .replace(/\.\w+$/, '.jpg')
    : undefined;

  const jsonLdSchemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MOBA Wiki',
      url: 'https://mobawiki.com/',
      description: 'Unofficial fan-made guide for Mobile Legends. Heroes stats, builds, rankings, items and more.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://mobawiki.com/2/heroes?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    ...(videoThumbnailUrl && defaultGame?.video_intro ? [{
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'Mobile Legends: Bang Bang — Gameplay Preview',
      description: 'Gameplay preview video for Mobile Legends: Bang Bang on MOBA Wiki.',
      thumbnailUrl: videoThumbnailUrl,
      contentUrl: defaultGame.video_intro,
      uploadDate: '2024-01-01',
      publisher: {
        '@type': 'Organization',
        name: 'MOBA Wiki',
        url: 'https://mobawiki.com',
      },
    }] : []),
  ];

  useSEO({
    description: 'MOBA Wiki — unofficial fan guide for Mobile Legends. Hero stats, tier list, counter picks, item builds, patch notes and ranked statistics. Updated daily.',
    jsonLd: jsonLdSchemas,
  });

  // Cache game data for next visit (LCP optimization)
  useEffect(() => {
    if (defaultGame) {
      setCachedGame(defaultGame.video_intro ?? null, defaultGame.preview ?? null, defaultGame.subtitle ?? null);
    }
  }, [defaultGame, setCachedGame]);

  // Build a fake game object from cache to render poster immediately
  const cachedGame = !defaultGame && (cachedVideoIntro || cachedPreview)
    ? { id: selectedGameId, video_intro: cachedVideoIntro, preview: cachedPreview, subtitle: cachedSubtitle, name: '' } as any
    : undefined;

  if (isError) return (
    <div className={styles.error}>
      {t('home.failedToLoadGames')}
      <button className={styles.retryBtn} onClick={() => window.location.reload()}>
        {t('common.retry')}
      </button>
    </div>
  );

  return (
    <div className={styles.homePageWrapper}>
      <NewHeroStrip gameId={selectedGameId} />
      <RecentActivityWidget />
      <VideoPreview game={defaultGame ?? cachedGame}>
        <HeroRankSection gameId={selectedGameId} />
      </VideoPreview>
      <div className={styles.contentSection}>
        <MatchesWidget />
        <MetaReport />
        <NewsWidget />
        <LastHeroesInfo />
      </div>
    </div>
  );
};