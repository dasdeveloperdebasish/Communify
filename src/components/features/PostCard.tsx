import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { Post } from '@/types/post';
import { formatNumber, formatRelativeTime } from '@/utils/helpers';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.meta}>
        <View style={styles.authorBadge}>
          <Text style={styles.authorInitial}>{post.authorName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.timestamp}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
        {post.id.startsWith('optimistic_') && (
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={12} color={colors.warning} />
            <Text style={styles.pendingText}>Posting...</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      <Text style={styles.body} numberOfLines={3}>
        {post.body}
      </Text>

      <View style={styles.footer}>
        <View style={styles.action}>
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={post.isLiked ? colors.error : colors.textMuted}
          />
          <Text style={styles.actionText}>{formatNumber(post.likeCount)}</Text>
        </View>
        <View style={styles.action}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
          <Text style={styles.actionText}>{formatNumber(post.commentCount)}</Text>
        </View>
        <View style={styles.action}>
          <Ionicons name="share-outline" size={16} color={colors.textMuted} />
          <Text style={styles.actionText}>Share</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  authorBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  metaInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  pendingText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
