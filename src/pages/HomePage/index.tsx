import { useGames } from '../../hooks/useGames';
import { useGameStore } from '../../store/gameStore';
import styles from './styles.module.scss';
import { Loader } from '../../components/Loader';
import { LastHeroesInfo } from '../../components/LastHeroesInfo';
import { TopHeroesRanked } from '../../components/TopHeroesRanked';
import { MoreInfoLink } from '../../components/MoreInfoLink';
import { RandomHeroStats } from '../../components/RandomHeroStats';

export const HomePage = () => {
  const { data: games, isLoading, isError } = useGames();
  const { selectedGameId } = useGameStore();
  const defaultGame = games?.find(g => g.id === selectedGameId);

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>Помилка завантаження ігор</div>;    

  return (
    <div className={styles['home-page-wrapper']}>
        <div className={styles['video-preview']}>
            <video 
                key={selectedGameId}
                src={defaultGame?.video_intro} 
                autoPlay 
                loop 
                muted 
                playsInline
                className={styles.video}
                poster={defaultGame?.preview}
            />
            <div className={styles['video-content']}>
                <h2>{defaultGame?.subtitle}</h2>
                <div className={styles['heroe-rank']}>
                    <TopHeroesRanked />
                    <MoreInfoLink linkTo={`${selectedGameId}/hero-ranks`} />
                </div>
            </div>
            <div className={styles['video-overlay']} />
        </div>
        <RandomHeroStats />
        <LastHeroesInfo />
        {/* <div className={styles['games-list']}>
            <div className={`${styles['video-overlay']} ${styles['list-overlay']}`} />
            {games?.map((game: Game) => (
                <div 
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`${styles.game} ${selectedGameId === game.id ? styles['game-selected'] : ''}`}
                    style={{backgroundImage: `url(${game.preview})`}}
                >
                    <div className={styles['game-overlay']} />
                    <div className={styles['game-content']}>
                        <h2 className={styles['game-title']}>{game.name}</h2>
                        <p className={styles['game-description']}>{game.description}</p>
                    </div>
                </div>
            ))}
        </div> */}
    </div>
  )
}