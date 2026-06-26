import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { CreatePostPayload, Post, PostListResponse } from '@/types/post';

const QUERY_KEYS = {
  posts: 'posts',
};

export function usePostList(communityId: string) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.posts, communityId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<PostListResponse>(endpoints.posts.list(communityId), {
        params: { page: pageParam, limit: 10 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const response = await apiClient.post<Post>(
        endpoints.posts.create(payload.communityId),
        payload
      );
      return response.data;
    },
    onSuccess: (newPost, payload) => {
      queryClient.setQueryData<{ pages: PostListResponse[]; pageParams: unknown[] }>(
        [QUERY_KEYS.posts, payload.communityId],
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  data: [newPost],
                  total: 1,
                  page: 1,
                  limit: 10,
                  hasMore: false,
                },
              ],
              pageParams: [1],
            };
          }
          const firstPage = old.pages[0];
          const alreadyExists = firstPage.data.some((p) => p.id === newPost.id);
          if (alreadyExists) return old;
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [newPost, ...firstPage.data],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );
    },
  });
}
