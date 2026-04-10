import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { requestInAppReview } from '../services/inAppReviewService';

const HERO_PATH_RE = /\/\d+\/heroes\/.+/;
const TRIGGER_AFTER = 5; // hero pages viewed in this session

/**
 * Tracks hero page views and requests in-app review after TRIGGER_AFTER views.
 * Mount once inside a component that has access to React Router (e.g. AppInner).
 */
export function useInAppReview() {
  const location = useLocation();
  const viewCount = useRef(0);
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    if (!HERO_PATH_RE.test(location.pathname)) return;

    viewCount.current += 1;

    if (viewCount.current >= TRIGGER_AFTER) {
      triggered.current = true;
      requestInAppReview();
    }
  }, [location.pathname]);
}
