import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { Community, CommunityFilters, CommunityListResponse } from '@/types/community';

const QUERY_KEYS = {
  communities: 'communities',
  community: 'community',
};

export function useCommunityList(filters: Omit<CommunityFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.communities, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<CommunityListResponse>(endpoints.communities.list, {
        params: { ...filters, page: pageParam, limit: 10 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCommunityDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.community, id],
    queryFn: async () => {
      const response = await apiClient.get<Community>(endpoints.communities.detail(id));
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const response = await apiClient.post<Community>(endpoints.communities.join(communityId));
      return response.data;
    },
    onMutate: async (communityId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.community, communityId] });

      const previousDetail = queryClient.getQueryData<Community>([
        QUERY_KEYS.community,
        communityId,
      ]);

      queryClient.setQueryData<Community>([QUERY_KEYS.community, communityId], (old) => {
        if (!old) return old;
        return { ...old, isJoined: true, memberCount: old.memberCount + 1 };
      });

      queryClient.setQueriesData<{ pages: CommunityListResponse[] }>(
        { queryKey: [QUERY_KEYS.communities] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((c) =>
                c.id === communityId ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c
              ),
            })),
          };
        }
      );

      return { previousDetail };
    },
    onError: (_err, communityId, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData([QUERY_KEYS.community, communityId], context.previousDetail);
      }
    },
    onSettled: (_, __, communityId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.community, communityId] });
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const response = await apiClient.post<Community>(endpoints.communities.leave(communityId));
      return response.data;
    },
    onMutate: async (communityId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.community, communityId] });

      const previousDetail = queryClient.getQueryData<Community>([
        QUERY_KEYS.community,
        communityId,
      ]);

      queryClient.setQueryData<Community>([QUERY_KEYS.community, communityId], (old) => {
        if (!old) return old;
        return { ...old, isJoined: false, memberCount: old.memberCount - 1 };
      });

      queryClient.setQueriesData<{ pages: CommunityListResponse[] }>(
        { queryKey: [QUERY_KEYS.communities] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((c) =>
                c.id === communityId ? { ...c, isJoined: false, memberCount: c.memberCount - 1 } : c
              ),
            })),
          };
        }
      );

      return { previousDetail };
    },
    onError: (_err, communityId, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData([QUERY_KEYS.community, communityId], context.previousDetail);
      }
    },
    onSettled: (_, __, communityId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.community, communityId] });
    },
  });
}
