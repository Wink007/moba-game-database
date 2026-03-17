import React, { memo, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsQuery, NewsItem } from '../hooks/useNewsQuery';
import { NewsModal } from './NewsModal';
import styles from './NewsWidget.module.scss';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const NewsCard = memo<{ item: NewsItem; onClick: (slug: string) => void }>(({ item, onClick }) => {
  const tag = item.tags?.[0]?.name;
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      aria-label={item.title}
      data-card
      onClick={() => onClick(item.slug)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(item.slug); }}
    >
      <img
        src={item.title_image_square_url || item.title_image_url}
        alt=""
        className={styles.cardImage}
        loading="lazy"
      />
      <div className={styles.overlay} />
      <div className={styles.cardContent}>
        {tag && <span className={styles.tag}>{tag}</span>}
        <span className={styles.cardTitle}>{item.title}</span>
        <span className={styles.date}>{formatDate(item.published_at)}</span>
      </div>
    </div>
  );
});

export const NewsWidget = memo(() => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError } = useNewsQuery(i18n.language);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]') as HTMLElement | null;
    const step = card ? card.offsetWidth + 10 : 220;
    track.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.dot} />
          <span className={styles.title}>{t('newsWidget.title')}</span>
        </div>
        <div className={styles.headerRight}>
          <a
            href="https://bo3.gg/mlbb/news"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewAll}
          >
            {t('newsWidget.viewAll')}
          </a>
          <button className={styles.navBtn} onClick={() => scroll('prev')} aria-label="Previous">‹</button>
          <button className={styles.navBtn} onClick={() => scroll('next')} aria-label="Next">›</button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {isLoading && Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`${styles.card} ${styles.skeletonCard}`} />
        ))}
        {isError && (
          <p className={styles.error}>{t('newsWidget.error')}</p>
        )}
        {!isLoading && !isError && data?.map(item => (
          <NewsCard key={item.id} item={item} onClick={setSelectedSlug} />
        ))}
      </div>

      {selectedSlug && (
        <NewsModal slug={selectedSlug} onClose={() => setSelectedSlug(null)} />
      )}
    </div>
  );
});

