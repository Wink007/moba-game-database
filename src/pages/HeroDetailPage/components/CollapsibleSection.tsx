import React, { useState } from 'react';
import styles from '../styles.module.scss';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  className,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`${styles.collapsibleSection}${className ? ` ${className}` : ''}`}>
      <button
        className={`${styles.collapsibleHeader}${expanded ? '' : ` ${styles.collapsibleHeaderCollapsed}`}`}
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        type="button"
      >
        <span className={styles.collapsibleTitle}>{title}</span>
        <svg
          className={`${styles.collapsibleChevron}${expanded ? '' : ` ${styles.collapsibleChevronCollapsed}`}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`${styles.collapsibleContent}${expanded ? '' : ` ${styles.collapsibleContentHidden}`}`}>
        {children}
      </div>
    </div>
  );
};
