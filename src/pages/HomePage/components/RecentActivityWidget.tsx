import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../../api/http/fetcher';
import styles from './RecentActivityWidget.module.scss';

interface ActivityEvent {
  type: 'new_user' | 'new_comment' | 'new_build';
  created_at: string;
  user_name: string;
  user_picture?: string;
  hero_name?: string;
  hero_head?: string;
  hero_slug?: string;
  game_id?: number;
  text?: string;
  build_name?: string;
}

function timeAgo(iso: string, t: (k: string, opts?: any) => string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return t('activity.justNow');
  if (diff < 3600) return t('activity.minutesAgo', { n: Math.floor(diff / 60) });
  if (diff < 86400) return t('activity.hoursAgo', { n: Math.floor(diff / 3600) });
  return t('activity.daysAgo', { n: Math.floor(diff / 86400) });
}

function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) return <img src={src} alt={name} className={styles.avatar} referrerPolicy="no-referrer" />;
  return (
    <div className={styles.avatarFallback}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function EventRow({ event, t }: { event: ActivityEvent; t: (k: string, opts?: any) => string }) {
  const heroLink = event.hero_slug && event.game_id
    ? `/${event.game_id}/heroes/${event.hero_slug}`
    : null;

  return (
    <div className={styles.row}>
      <Avatar src={event.user_picture} name={event.user_name} />
      <div className={styles.rowContent}>
        <span className={styles.rowText}>
          <span className={styles.userName}>{event.user_name}</span>
          {' '}
          {event.type === 'new_user' && (
            <span className={styles.action}>{t('activity.joined')}</span>
          )}
          {event.type === 'new_comment' && (
            <>
              <span className={styles.action}>{t('activity.commented')}</span>
              {' '}
              {heroLink ? (
                <Link to={heroLink} className={styles.heroLink}>
                  {event.hero_name}
                </Link>
              ) : (
                <span>{event.hero_name}</span>
              )}
            </>
          )}
          {event.type === 'new_build' && (
            <>
              <span className={styles.action}>{t('activity.createdBuild')}</span>
              {' '}
              <span className={styles.buildName}>«{event.build_name}»</span>
              {' '}
              {t('activity.forHero')}
              {' '}
              {heroLink ? (
                <Link to={heroLink} className={styles.heroLink}>
                  {event.hero_name}
                </Link>
              ) : (
                <span>{event.hero_name}</span>
              )}
            </>
          )}
        </span>
        {event.type === 'new_comment' && event.text && (
          <span className={styles.commentPreview}>"{event.text}"</span>
        )}
        <span className={styles.time}>{timeAgo(event.created_at, t)}</span>
      </div>
      {event.hero_head && (
        <img src={event.hero_head} alt={event.hero_name} className={styles.heroThumb} />
      )}
    </div>
  );
}

export const RecentActivityWidget: React.FC = () => {
  const { t } = useTranslation();

  const { data: events, isLoading } = useQuery<ActivityEvent[]>({
    queryKey: ['activity-feed'],
    queryFn: () => fetcher('/activity?limit=15'),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });

  if (isLoading || !events?.length) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.dot} />
        <h2 className={styles.title}>{t('activity.title')}</h2>
      </div>
      <div className={styles.list}>
        {events.map((ev, i) => (
          <EventRow key={`${ev.type}-${ev.created_at}-${i}`} event={ev} t={t} />
        ))}
      </div>
    </div>
  );
};
