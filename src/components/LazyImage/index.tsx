import React, { useState, forwardRef } from 'react';
import styles from './styles.module.scss';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** true — wrapper is display:block width:100% height:100% (fill parent). Default: inline-block (shrinks to img size). */
  fill?: boolean;
  /** true — skips shimmer, no opacity fade, fetchPriority="high". Use for above-the-fold LCP images. */
  priority?: boolean;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  shimmerClassName?: string;
}

export const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(
  ({ className, wrapperClassName, wrapperStyle, shimmerClassName, fill = false, priority = false, alt, ...props }, ref) => {
    const [loaded, setLoaded] = useState(priority);
    const [error, setError] = useState(false);

    const wrapperClass = [
      styles.wrapper,
      fill ? styles.wrapperFill : styles.wrapperInline,
      wrapperClassName ?? '',
    ].join(' ');

    return (
      <span className={wrapperClass} style={wrapperStyle}>
        {!loaded && !error && !priority && (
          <span className={`${styles.shimmer} ${shimmerClassName ?? ''}`} aria-hidden="true" />
        )}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          ref={ref}
          alt={alt}
          {...props}
          fetchPriority={priority ? 'high' : (props as any).fetchPriority}
          className={`${styles.img} ${loaded ? styles.imgLoaded : ''} ${className ?? ''}`}
          onLoad={(e) => { setLoaded(true); props.onLoad?.(e); }}
          onError={(e) => { setError(true); setLoaded(true); props.onError?.(e); }}
        />
      </span>
    );
  }
);

LazyImage.displayName = 'LazyImage';
