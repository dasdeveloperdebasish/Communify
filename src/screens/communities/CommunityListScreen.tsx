import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCommunityList, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunities';
import { CommunityCard } from '@/components/features/CommunityCard';
import { CommunityCardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
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
  const categoryScrollRef = useRef<ScrollView>(null);
  const chipPositions = useRef<Record<string, number>>({});
  const flatListRef = useRef<FlatList<Community>>(null);

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

  useEffect(() => {
    if (communities.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [filters]);

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

  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat);
    const x = chipPositions.current[cat] ?? 0;
    categoryScrollRef.current?.scrollTo({
      x: Math.max(0, x - spacing.md),
      animated: true,
    });
  }, []);

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
  const totalCount = data?.pages[0]?.total ?? 0;

  return (
    <View style={styles.container}>
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

      <View style={styles.categoriesWrapper}>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => handleCategorySelect(cat)}
              onLayout={(e) => {
                chipPositions.current[cat] = e.nativeEvent.layout.x;
              }}
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
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {isLoading ? 'Loading...' : `${totalCount} communities`}
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
      ) : (
        <FlatList
          ref={flatListRef}
          data={communities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
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
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    height: 40,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body2,
    color: colors.textPrimary,
    padding: 0,
    height: 40,
    includeFontPadding: false,
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
  categoriesWrapper: {
    height: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: colors.background,
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
    paddingTop: spacing.sm,
  },
  skeletonContainer: {
    padding: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
