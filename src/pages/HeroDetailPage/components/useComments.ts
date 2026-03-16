import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '../../../store/authStore';
import { queryKeys } from '../../../queries/keys';

export interface Comment {
  id: number;
  hero_id: number;
  user_id: number;
  text: string;
  likes: number;
  created_at: string;
  author_name: string;
  author_picture: string;
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
}

export const useComments = (heroId: number) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.comments.hero(heroId) });

  const { data, isLoading, isError } = useQuery<CommentsResponse>({
    queryKey: queryKeys.comments.hero(heroId),
    queryFn: () => authFetch(`/heroes/${heroId}/comments?size=50`),
    enabled: !!heroId,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const postMutation = useMutation({
    mutationFn: (text: string) =>
      authFetch(`/heroes/${heroId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) =>
      authFetch(`/comments/${commentId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: number) =>
      authFetch(`/comments/${commentId}/like`, { method: 'POST' }),
  });

  return {
    comments: data?.comments ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    postMutation,
    deleteMutation,
    likeMutation,
  };
};
