import { useTranslation } from 'react-i18next';
import { useGamesQuery } from '../../queries/useGamesQuery';
import { useGameStore } from '../../store/gameStore';
import { Loader } from '../../components/Loader';
import { LastHeroesInfo } from '../../components/LastHeroesInfo';
import { RandomHeroStats } from '../../components/RandomHeroStats';
import { VideoPreview } from './components/VideoPreview';
import { HeroRankSection } from './components/HeroRankSection';
import styles from './styles.module.scss';

export const HomePage = () => {
  const { t } = useTranslation();
  const { data: games, isLoading, isError } = useGamesQuery();
  const { selectedGameId } = useGameStore();
  const defaultGame = games?.find(g => g.id === selectedGameId);

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>{t('home.failedToLoadGames')}</div>;    

  return (
    <div className={styles.homePageWrapper}>
      <VideoPreview game={defaultGame}>
        <HeroRankSection gameId={selectedGameId} />
      </VideoPreview>
      <RandomHeroStats />
      <LastHeroesInfo />
    </div>
  );
};