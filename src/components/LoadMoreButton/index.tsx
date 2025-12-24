import React from 'react';
import styles from './styles.module.scss';

interface LoadMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  onClick, 
  disabled = false, 
  loading = false,
  children = 'Show More'
}) => {
  return (
    <div className={styles.loadMoreSection}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={styles.loadMoreButton}
      >
        {loading ? 'Loading...' : children}
      </button>
    </div>
  );
};

export default LoadMoreButton;
