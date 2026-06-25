import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCommunityList, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { CommunityCard } from '@/components/features/CommunityCard';
import { CommunityCardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Community } from '@/types/community';
import { CommunitiesStackParamList } from '@/navigation/MainNavigator';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

type NavigationProp = NativeStackNavigationProp<CommunitiesStackParamList, 'CommunityList'>;

const CATEGORIES = ['All', 'Technology', 'Design', 'Business', 'Gaming', 'Lifestyle'];
const SORT_OPTIONS = [
  { label: 'Most Members', value: 'memberCount' },
  { label: 'Most Posts', value: 'postCount' },
  { label: 'Name', value: 'name' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export function CommunityListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortValue>('memberCount');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      category: selectedCategory,
      sortBy,
      sortOrder: 'desc' as const,
    }),
    [debouncedSearch, selectedCategory, sortBy]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCommunityList(filters);

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  const communities = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearch(text);
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      const timer = setTimeout(() => setDebouncedSearch(text), 400);
      setSearchDebounceTimer(timer);
    },
    [searchDebounceTimer]
  );

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCommunityPress = useCallback(
    (community: Community) => {
      navigation.navigate('CommunityDetail', {
        communityId: community.id,
        communityName: community.name,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Community }) => (
      <CommunityCard
        community={item}
        onPress={() => handleCommunityPress(item)}
        onJoin={() => joinMutation.mutate(item.id)}
        onLeave={() => leaveMutation.mutate(item.id)}
        isJoinLoading={
          (joinMutation.isPending && joinMutation.variables === item.id) ||
          (leaveMutation.isPending && leaveMutation.variables === item.id)
        }
      />
    ),
    [handleCommunityPress, joinMutation, leaveMutation]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons name="filter-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {isLoading ? 'Loading...' : `${data?.pages[0]?.total ?? 0} communities`}
        </Text>
        <Text style={styles.sortText}>Sorted by {activeSortLabel}</Text>
      </View>

      {isLoading ? (
        <ScrollView
          contentContainerStyle={styles.skeletonContainer}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <CommunityCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : isError ? (
        <ErrorState
          message="Failed to load communities. Please check your connection and try again."
          onRetry={refetch}
        />
      ) : communities.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No communities found"
          subtitle={
            debouncedSearch
              ? `No results for "${debouncedSearch}"`
              : 'Try a different category or search term'
          }
          actionLabel={debouncedSearch ? 'Clear Search' : undefined}
          onAction={debouncedSearch ? handleClearSearch : undefined}
        />
      ) : (
        <FlashList
          data={communities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body2,
    color: colors.textPrimary,
    padding: 0,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortMenu: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sortOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  sortOptionText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  categoriesScroll: {
    maxHeight: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sortText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  listContent: {
    padding: spacing.md,
  },
  skeletonContainer: {
    padding: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
