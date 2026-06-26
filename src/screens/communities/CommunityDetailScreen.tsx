import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PostCardSkeleton } from '@/components/common/LoadingSkeleton';
import { PostCard } from '@/components/features/PostCard';
import { useCommunityDetail, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { usePostList } from '@/hooks/usePosts';
import { CommunitiesStackParamList } from '@/navigation/MainNavigator';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { Post } from '@/types/post';
import { formatNumber, formatRelativeTime } from '@/utils/helpers';

type RouteProps = RouteProp<CommunitiesStackParamList, 'CommunityDetail'>;
type NavigationProp = NativeStackNavigationProp<CommunitiesStackParamList, 'CommunityDetail'>;

function CommunityHeader({
  communityId,
  onCreatePost,
}: {
  communityId: string;
  onCreatePost: () => void;
}) {
  const { data: community, isLoading, isError, refetch } = useCommunityDetail(communityId);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  if (isLoading) {
    return (
      <View style={styles.headerSkeleton}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !community) {
    return <ErrorState message="Failed to load community details." onRetry={refetch} />;
  }

  const isJoinLoading = joinMutation.isPending || leaveMutation.isPending;

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Avatar name={community.name} size="lg" />
        <View style={styles.headerInfo}>
          <Text style={styles.communityName} numberOfLines={1} adjustsFontSizeToFit>
            {community.name}
          </Text>
          <Badge label={community.category} variant="primary" />
        </View>
        <TouchableOpacity
          style={[styles.joinButton, community.isJoined && styles.joinedButton]}
          onPress={() =>
            community.isJoined
              ? leaveMutation.mutate(community.id)
              : joinMutation.mutate(community.id)
          }
          disabled={isJoinLoading}
          activeOpacity={0.8}
        >
          {isJoinLoading ? (
            <ActivityIndicator
              size="small"
              color={community.isJoined ? colors.primary : colors.surface}
            />
          ) : (
            <>
              <Ionicons
                name={community.isJoined ? 'checkmark-circle' : 'add-circle-outline'}
                size={16}
                color={community.isJoined ? colors.primary : colors.surface}
              />
              <Text style={[styles.joinButtonText, community.isJoined && styles.joinedButtonText]}>
                {community.isJoined ? 'Joined' : 'Join'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{community.description}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{formatNumber(community.memberCount)}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{formatNumber(community.postCount)}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{formatRelativeTime(community.createdAt)}</Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
      </View>

      {community.rules && community.rules.length > 0 && (
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>Community Rules</Text>
          {community.rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <View style={styles.ruleNumber}>
                <Text style={styles.ruleNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Posts</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreatePost} activeOpacity={0.8}>
          <Ionicons name="create-outline" size={16} color={colors.surface} />
          <Text style={styles.createButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CommunityDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { communityId, communityName } = route.params;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePostList(communityId);

  const posts = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const handleCreatePost = useCallback(() => {
    navigation.navigate('CreatePost', { communityId, communityName });
  }, [navigation, communityId, communityName]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: Post }) => <PostCard post={item} />, []);

  const renderHeader = useCallback(
    () => <CommunityHeader communityId={communityId} onCreatePost={handleCreatePost} />,
    [communityId, handleCreatePost]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </View>
      );
    }
    if (isError) {
      return <ErrorState message="Failed to load posts." onRetry={refetch} />;
    }
    return (
      <EmptyState
        icon="document-text-outline"
        title="No posts yet"
        subtitle="Be the first to post in this community"
        actionLabel="Create Post"
        onAction={handleCreatePost}
      />
    );
  }, [isLoading, isError, refetch, handleCreatePost]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={isRefetching}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerSkeleton: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.md,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  communityName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  joinButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.surface,
  },
  joinedButtonText: {
    color: colors.primary,
  },
  description: {
    ...typography.body2,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    lineHeight: 22,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  rulesContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rulesTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ruleNumber: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ruleNumberText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  ruleText: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  postsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  createButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.surface,
  },
  skeletonContainer: {
    gap: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
