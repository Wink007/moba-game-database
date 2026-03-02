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
  const isMobile = window.innerWidth <= 768;
  const transform = isMobile ? 'so_0,w_640,q_auto:low' : 'so_0,w_1280,q_auto';
  return url
    .replace('/video/upload/', `/video/upload/${transform}/`)
    .replace(/\.\w+$/, '.jpg');
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({ game, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [game?.id]);

  return (
    <div className={styles.videoPreview} style={!game ? { background: 'linear-gradient(180deg, #0d1117 0%, #0a0f1e 100%)' } : undefined}>
      {game && (
        game.video_intro ? (
          <video
            ref={videoRef}
            key={game.id}
            src={getOptimizedVideoUrl(game.video_intro)}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className={styles.video}
            poster={getVideoPosterUrl(game.video_intro)}
            {...{ fetchpriority: 'high' } as any}
          />
        ) : (
          <img
            src={game.preview}
            alt={game.name}
            className={styles.posterImage}
            loading="eager"
            fetchPriority="high"
          />
        )
      )}
      <div className={styles.overlay} />
      <div className={styles.noise} />
      <div className={styles.content}>
        {/* Always reserve space for titleBlock to avoid CLS */}
        <div className={styles.titleBlock} style={!game ? { visibility: 'hidden' } : undefined}>
          <h2>{game?.subtitle ?? '\u00A0'}</h2>
          <div className={styles.glowLine} />
        </div>
        {children}
      </div>
    </div>
  );
};
