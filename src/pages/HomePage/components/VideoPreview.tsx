import React from 'react';
import { VideoPreviewProps } from './interface';
import styles from './VideoPreview.module.scss';

export const VideoPreview: React.FC<VideoPreviewProps> = ({ game, children }) => {
  if (!game) return null;

  return (
    <div className={styles.videoPreview}>
      <video 
        key={game.id}
        src={game.video_intro} 
        autoPlay 
        loop 
        muted 
        playsInline
        className={styles.video}
        poster={game.preview}
      />
      <div className={styles.videoContent}>
        <h2>{game.subtitle}</h2>
        {children}
      </div>
      <div className={styles.videoOverlay} />
    </div>
  );
};
