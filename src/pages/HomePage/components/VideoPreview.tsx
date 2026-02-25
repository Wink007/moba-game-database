import React, { useRef, useEffect } from 'react';
import { VideoPreviewProps } from './interface';
import styles from './VideoPreview.module.scss';

const getOptimizedVideoUrl = (url: string): string => {
  if (!url.includes('cloudinary.com')) return url;
  const isMobile = window.innerWidth <= 768;
  return url.replace(
    '/upload/',
    isMobile ? '/upload/q_auto:low,w_640,br_800k/' : '/upload/q_auto,w_1280/'
  );
};

const getVideoPosterUrl = (url: string): string => {
  if (!url.includes('cloudinary.com')) return '';
  return url
    .replace('/video/upload/', '/video/upload/so_0,w_1280,q_auto/')
    .replace(/\.\w+$/, '.jpg');
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({ game, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [game?.id]);

  if (!game) return null;

  return (
    <div className={styles.videoPreview}>
      {game.video_intro ? (
        <video 
          ref={videoRef}
          key={game.id}
          src={getOptimizedVideoUrl(game.video_intro)}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className={styles.video}
          poster={getVideoPosterUrl(game.video_intro)}
        />
      ) : (
        <img 
          src={game.preview} 
          alt={game.name} 
          className={styles.posterImage}
          loading="eager"
        />
      )}
      <div className={styles.overlay} />
      <div className={styles.noise} />
      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2>{game.subtitle}</h2>
          <div className={styles.glowLine} />
        </div>
        {children}
      </div>
    </div>
  );
};
