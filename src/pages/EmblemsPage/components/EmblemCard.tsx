import { EmblemCardProps } from './interface';
import styles from './EmblemCard.module.scss';

export const EmblemCard = ({ emblem }: EmblemCardProps) => {
  return (
    <div className={styles.emblemCard}>
      <div className={styles.emblemHeader}>
        {emblem.icon_url && (
          <img
            src={emblem.icon_url}
            alt={emblem.name}
            className={styles.emblemIcon}
          />
        )}
        <h2 className={styles.emblemName}>{emblem.name}</h2>
      </div>
      
      {emblem.description && (
        <p className={styles.emblemDescription}>{emblem.description}</p>
      )}

      {emblem.base_stats && Object.keys(emblem.base_stats).length > 0 && (
        <div className={styles.baseStats}>
          <div className={styles.statsTitle}>Base Stats</div>
          {Object.entries(emblem.base_stats).map(([stat, value]) => (
            <div key={stat} className={styles.statRow}>
              <span>{stat}</span>
              <span className={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
