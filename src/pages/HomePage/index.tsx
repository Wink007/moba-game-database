import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useGamesQuery } from '../../queries/useGamesQuery';
import { useGameStore } from '../../store/gameStore';
import { LastHeroesInfo } from '../../components/LastHeroesInfo';
import { RandomHeroStats } from '../../components/RandomHeroStats';
import { VideoPreview } from './components/VideoPreview';
import { HeroRankSection } from './components/HeroRankSection';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

export const HomePage = () => {
  const { t } = useTranslation();
  useSEO({ title: 'Home', description: 'Mobile Legends Wiki — heroes stats, builds, counter picks, items, emblems, spells and patch notes.' });
  const { data: games, isLoading, isError } = useGamesQuery();
  const { selectedGameId, cachedVideoIntro, cachedPreview, cachedSubtitle, setCachedGame } = useGameStore();
  const defaultGame = games?.find(g => g.id === selectedGameId);

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

  if (isError) return <div className={styles.error}>{t('home.failedToLoadGames')}</div>;

  return (
    <div className={styles.homePageWrapper}>
      <VideoPreview game={defaultGame ?? cachedGame}>
        <HeroRankSection gameId={selectedGameId} />
      </VideoPreview>
      <RandomHeroStats />
      <LastHeroesInfo />
    </div>
  );
};