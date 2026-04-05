import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../../api/http/fetcher';
import styles from './RecentActivityWidget.module.scss';

interface ActivityEvent {
  type: 'new_user' | 'new_comment' | 'new_build';
  created_at: string;
  user_id?: number;
  user_name: string;
  user_picture?: string;
  hero_name?: string;
  hero_head?: string;
  hero_slug?: string;
  game_id?: number;
  text?: string;
  build_name?: string;
}

function TickerItem({ event, t }: { event: ActivityEvent; t: (k: string, opts?: any) => string }) {
  const heroLink = event.hero_slug && event.game_id ? `/${event.game_id}/heroes/${event.hero_slug}` : null;
  const profileLink = event.user_id ? `/profile/${event.user_id}` : null;
  const avatar = event.user_picture
    ? <img src={event.user_picture} alt={event.user_name} className={styles.tickerAvatar} referrerPolicy="no-referrer" />
    : <span className={styles.tickerAvatarFallback}>{event.user_name.charAt(0).toUpperCase()}</span>;
  return (
    <span className={styles.tickerItem}>
      {profileLink ? <Link to={profileLink} className={styles.tickerProfileLink}>{avatar}</Link> : avatar}
      {' '}
      {profileLink
        ? <Link to={profileLink} className={styles.tickerUser}>{event.user_name}</Link>
        : <span className={styles.tickerUser}>{event.user_name}</span>
      }{' '}
      {event.type === 'new_user' && <span className={styles.tickerAction}>{t('activity.joined')}</span>}
      {event.type === 'new_comment' && (
        <><span className={styles.tickerAction}>{t('activity.commented')}</span>{' '}
          {heroLink ? <Link to={heroLink} className={styles.tickerHero}>{event.hero_name}</Link> : <span>{event.hero_name}</span>}
        </>
      )}
      {event.type === 'new_build' && (
        <><span className={styles.tickerAction}>{t('activity.createdBuild')}</span>{' '}
          <span className={styles.tickerBuild}>«{event.build_name}»</span>{' '}
          {t('activity.forHero')}{' '}
          {heroLink ? <Link to={heroLink} className={styles.tickerHero}>{event.hero_name}</Link> : <span>{event.hero_name}</span>}
        </>
      )}
      <span className={styles.tickerSep}>•</span>
    </span>
  );
}

export const RecentActivityWidget: React.FC = () => {
  const { t } = useTranslation();

  const { data: events } = useQuery<ActivityEvent[]>({
    queryKey: ['activity-feed'],
    queryFn: () => fetcher('/activity?limit=15'),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });

  if (!events?.length) return null;

  const items = [...events, ...events];

  return (
    <div className={styles.ticker}>
      <span className={styles.tickerLabel}>
        <span className={styles.dot} />
        {t('activity.title')}
      </span>
      <div className={styles.tickerTrack}>
        <div className={styles.tickerScroll} style={{ '--item-count': events.length } as React.CSSProperties}>
          {items.map((ev, i) => <TickerItem key={i} event={ev} t={t} />)}
        </div>
      </div>
    </div>
  );
};
