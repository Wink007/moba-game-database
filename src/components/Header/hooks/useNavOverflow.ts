import { useState, useRef, useCallback, useEffect } from 'react';
import { DESKTOP_NAV, MORE_BTN_W } from '../navConfig';

export const useNavOverflow = () => {
  const [overflowStart, setOverflowStart] = useState(DESKTOP_NAV.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const recalcOverflow = useCallback(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;
    const navW = nav.offsetWidth;
    if (navW < 50) return;
    const items = Array.from(measure.children) as HTMLElement[];
    if (items.length === 0 || items[0].offsetWidth === 0) return;

    let totalW = 0;
    for (let i = 0; i < items.length; i++) {
      totalW += items[i].offsetWidth + (i > 0 ? 4 : 0);
    }
    if (totalW <= navW) {
      setOverflowStart(DESKTOP_NAV.length);
      return;
    }

    let used = 0;
    let cut = 0;
    for (let i = 0; i < items.length; i++) {
      const itemW = items[i].offsetWidth + (i > 0 ? 4 : 0);
      if (used + itemW + MORE_BTN_W > navW) {
        cut = i;
        break;
      }
      used += itemW;
      cut = i + 1;
    }
    setOverflowStart(cut);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(recalcOverflow);
    ro.observe(nav);
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(recalcOverflow);
    });
    return () => { ro.disconnect(); cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [recalcOverflow]);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  return { navRef, measureRef, moreRef, overflowStart, moreOpen, setMoreOpen };
};
