import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../../config';

function toBo3Locale(lang: string): string {
  if (lang === 'uk') return 'ua';
  return lang; // 'en', 'id' pass through
}

export interface NewsBodyBlock {
  id: string;
  type: 'paragraph' | 'image' | string;
  data: Record<string, unknown>;
}

export interface NewsDetail {
  id: number;
  slug: string;
  title: string;
  title_image_url: string;
  title_image_square_url: string;
  published_at: string;
  body: { blocks: NewsBodyBlock[] };
  tags: { id: number; name: string; slug: string }[];
  author: {
    nickname: string;
    first_name: string;
    last_name: string;
    image_versions?: { '50x50'?: string; webp?: string };
  } | null;
}

async function fetchNewsDetail(slug: string, lang: string): Promise<NewsDetail> {
  const locale = toBo3Locale(lang);
  const res = await fetch(`${API_URL}/news/${encodeURIComponent(slug)}?locale=${locale}`);
  if (!res.ok) throw new Error('news detail fetch failed');
  return res.json();
}

export function useNewsDetailQuery(slug: string | null, lang: string) {
  return useQuery({
    queryKey: ['bo3-news-detail', slug, lang],
    queryFn: () => fetchNewsDetail(slug!, lang),
    enabled: !!slug,
    staleTime: 10 * 60_000,
    refetchInterval: false,
  });
}
