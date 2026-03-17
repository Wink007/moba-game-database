import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../../config';

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
}

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  title_image_url: string;
  title_image_square_url: string;
  published_at: string;
  tags: NewsTag[];
  author: { nickname: string } | null;
}

function toBo3Locale(lang: string): string {
  if (lang === 'uk') return 'ua';
  return lang; // 'en', 'id' pass through
}

const NEWS_LIMIT = 12;

async function fetchNews(lang: string): Promise<NewsItem[]> {
  const locale = toBo3Locale(lang);
  const res = await fetch(`${API_URL}/news?limit=${NEWS_LIMIT}&locale=${locale}`);
  if (!res.ok) throw new Error('news fetch failed');
  const data = await res.json();
  return (data.results ?? []) as NewsItem[];
}

export function useNewsQuery(lang: string) {
  return useQuery({
    queryKey: ['bo3-news', lang, NEWS_LIMIT],
    queryFn: () => fetchNews(lang),
    staleTime: 5 * 60_000,
    refetchInterval: false,
  });
}
