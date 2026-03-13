import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateLanes } from '../../../utils/translation';
import { LaneArrow, LANE_POSITIONS } from './LaneArrow';
import { LaneMapProps } from './interfaces';
import styles from '../styles.module.scss';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 768);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};


export const LaneMap: React.FC<LaneMapProps> = React.memo(({ lanes }) => {
  const { i18n } = useTranslation();
  const [fullscreen, setFullscreen] = React.useState(false);
  const isMobile = useIsMobile();
  const activeLanes = lanes.map(l => l.trim()).filter(l => LANE_POSITIONS[l]);

  if (activeLanes.length === 0) return null;

  const mapContent = (isFullscreen: boolean) => (
    <div className={`${styles.laneMapContainer} ${isFullscreen ? styles.laneMapFullscreenContent : ''}`}>
      <img
        src="/mlbbmap.jpg"
        alt="MLBB Map"
        className={styles.laneMapImg}
        draggable={false}
      />

      {/* Pulsing lane direction arrow */}
      <LaneArrow lane={activeLanes[0]} isMobile={isMobile} />
    </div>
  );

  return (
    <div className={styles.laneMap}>
      <div onClick={() => setFullscreen(true)} style={{ cursor: 'pointer' }}>
        {mapContent(false)}
      </div>

      {/* Lane labels below map */}
      <div className={styles.laneMapLabels}>
        {activeLanes.map((lane) => (
          <span key={lane} className={styles.laneMapLabel}>
            {translateLanes([lane], i18n.language)[0]}
          </span>
        ))}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className={styles.laneMapOverlay} onClick={() => setFullscreen(false)}>
          {mapContent(true)}
        </div>
      )}
    </div>
  );
});

LaneMap.displayName = 'LaneMap';
