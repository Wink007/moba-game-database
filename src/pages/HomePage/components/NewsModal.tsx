import React, { useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNewsDetailQuery, NewsBodyBlock } from '../hooks/useNewsDetailQuery';
import styles from './NewsModal.module.scss';

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(
    lang === 'uk' ? 'uk-UA' : lang === 'id' ? 'id-ID' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

function renderBlock(block: NewsBodyBlock, i: number) {
  if (block.type === 'paragraph') {
    const text = (block.data as { text: string }).text;
    if (text.length <= 40 && !/<[a-z]/i.test(text)) return null;
    return (
      <p
        key={block.id ?? i}
        className={styles.paragraph}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  if (block.type === 'header') {
    const data = block.data as { text: string; level?: number };
    const level = Math.min(Math.max(data.level ?? 2, 2), 4);
    const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
    return <Tag key={block.id ?? i} className={styles.blockHeader} dangerouslySetInnerHTML={{ __html: data.text }} />;
  }
  if (block.type === 'list') {
    const data = block.data as { style?: string; items: string[] };
    const Tag = data.style === 'ordered' ? 'ol' : 'ul';
    return (
      <Tag key={block.id ?? i} className={styles.blockList}>
        {data.items.map((item, j) => (
          <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </Tag>
    );
  }
  if (block.type === 'image') {
    const data = block.data as { file?: { url: string }; caption?: string };
    const url = data.file?.url;
    if (!url) return null;
    const caption = data.caption?.replace(/&nbsp;/g, '').trim();
    return (
      <figure key={block.id ?? i} className={styles.blockFigure}>
        <img src={url} alt={caption || ''} className={styles.blockImage} loading="lazy" />
        {caption && <figcaption className={styles.imageCaption}>{caption}</figcaption>}
      </figure>
    );
  }
  return null;
}

interface Props {
  slug: string;
  onClose: () => void;
}

export const NewsModal = memo<Props>(({ slug, onClose }) => {
  const { i18n, t } = useTranslation();
  const { data, isLoading } = useNewsDetailQuery(slug, i18n.language);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sourceHref = `https://bo3.gg/mlbb/news/${slug}`;

  const modal = (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={data?.title ?? 'News'}
    >
      <div className={styles.modal}>

        {/* ── Close button ── */}
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Skeleton ── */}
        {isLoading && (
          <div className={styles.skeleton}>
            <div className={`${styles.skBone} ${styles.skHero}`} />
            <div className={styles.skBody}>
              <div className={`${styles.skBone} ${styles.skTag}`} />
              <div className={`${styles.skBone} ${styles.skTitle}`} />
              <div className={`${styles.skBone} ${styles.skTitleShort}`} />
              <div className={`${styles.skBone} ${styles.skMeta}`} />
              {[100, 100, 85, 100, 70, 100, 60].map((w, i) => (
                <div key={i} className={`${styles.skBone} ${styles.skLine}`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {!isLoading && data && (
          <>
            {/* Hero image with gradient overlay */}
            <div className={styles.hero}>
              {data.title_image_url && (
                <img
                  src={data.title_image_url}
                  alt={data.title}
                  className={styles.heroImg}
                  loading="eager"
                />
              )}
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                {data.tags.length > 0 && (
                  <div className={styles.tags}>
                    {data.tags.map(tag => (
                      <span key={tag.id} className={styles.tag}>{tag.name}</span>
                    ))}
                  </div>
                )}
                <h2 className={styles.title}>{data.title}</h2>
                <div className={styles.meta}>
                  {data.author?.image_versions?.['50x50']
                    ? <img src={data.author.image_versions['50x50']} alt={data.author.nickname} className={styles.avatar} />
                    : <div className={styles.avatarFallback}>{data.author?.nickname?.[0] ?? '?'}</div>
                  }
                  <span className={styles.authorName}>{data.author?.nickname}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.date}>{formatDate(data.published_at, i18n.language)}</span>
                </div>
              </div>
            </div>

            {/* Article body */}
            <div className={styles.body}>
              {data.body.blocks.map((block, i) => renderBlock(block, i))}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <a href={sourceHref} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                {t('newsWidget.source')} →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
});

