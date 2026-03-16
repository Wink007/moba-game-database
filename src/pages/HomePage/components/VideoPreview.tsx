import React, { useRef, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';
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
  useTranslation();
  const user = useAuthStore(s => s.user);
  const displayName = user ? (user.nickname || user.name) : '';
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
          <>
            {/* Poster loads immediately as LCP element — video plays on top once ready */}
            <img
              src={getVideoPosterUrl(game.video_intro)}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className={styles.video}
              style={{ objectFit: 'cover', opacity: 0.35, filter: 'brightness(1.1) saturate(1.2)' }}
            />
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
            />
          </>
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
      <div className={styles.content}>        {user && (
          <p className={styles.welcomeText}>
            <Trans
              i18nKey="home.welcome"
              values={{ name: displayName }}
              components={[<span className={styles.welcomeName} />]}
            />
          </p>
        )}        {/* Always reserve space for titleBlock to avoid CLS */}
        <div className={styles.titleBlock} style={!game ? { visibility: 'hidden' } : undefined}>
          <div className={styles.glowLine} />
        </div>
        {children}
      </div>
    </div>
  );
};
