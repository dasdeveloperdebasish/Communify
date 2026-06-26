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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.posts, payload.communityId],
      });

      const previousPosts = queryClient.getQueryData([QUERY_KEYS.posts, payload.communityId]);

      const optimisticPost: Post = {
        id: `optimistic_${Date.now()}`,
        communityId: payload.communityId,
        title: payload.title,
        body: payload.body,
        authorId: 'current_user',
        authorName: 'You',
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<{ pages: PostListResponse[]; pageParams: unknown[] }>(
        [QUERY_KEYS.posts, payload.communityId],
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  data: [optimisticPost],
                  total: 1,
                  page: 1,
                  limit: 10,
                  hasMore: false,
                },
              ],
              pageParams: [1],
            };
          }
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0 ? { ...page, data: [optimisticPost, ...page.data] } : page
            ),
          };
        }
      );

      return { previousPosts };
    },
    onError: (_err, payload, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData([QUERY_KEYS.posts, payload.communityId], context.previousPosts);
      }
    },
    onSuccess: (newPost, payload) => {
      queryClient.setQueryData<{ pages: PostListResponse[]; pageParams: unknown[] }>(
        [QUERY_KEYS.posts, payload.communityId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    data: page.data.map((p) => (p.id.startsWith('optimistic_') ? newPost : p)),
                  }
                : page
            ),
          };
        }
      );
    },
  });
}
