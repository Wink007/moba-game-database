import styles from './styles.module.scss';

export const Loader = () => {
  return (
    <div className={styles.loader} role="status" aria-label="Loading">
      <div className={styles.grid}>
        <span className={`${styles.letter} ${styles.l1}`}>M</span>
        <span className={`${styles.letter} ${styles.l2}`}>O</span>
        <span className={`${styles.letter} ${styles.l3}`}>B</span>
        <span className={`${styles.letter} ${styles.l4}`}>A</span>
      </div>
    </div>
  );
};
