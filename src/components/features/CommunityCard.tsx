import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Community } from '@/types/community';
import { formatNumber } from '@/utils/helpers';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

interface CommunityCardProps {
  community: Community;
  onPress: () => void;
  onJoin: () => void;
  onLeave: () => void;
  isJoinLoading?: boolean;
}

export function CommunityCard({
  community,
  onPress,
  onJoin,
  onLeave,
  isJoinLoading = false,
}: CommunityCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Avatar name={community.name} size="md" />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {community.name}
          </Text>
          <Badge label={community.category} variant="primary" />
        </View>
        <TouchableOpacity
          style={[styles.joinButton, community.isJoined && styles.joinedButton]}
          onPress={community.isJoined ? onLeave : onJoin}
          disabled={isJoinLoading}
          activeOpacity={0.8}
        >
          {isJoinLoading ? (
            <Ionicons
              name="sync-outline"
              size={16}
              color={community.isJoined ? colors.primary : colors.surface}
            />
          ) : (
            <Ionicons
              name={community.isJoined ? 'checkmark-circle' : 'add-circle-outline'}
              size={16}
              color={community.isJoined ? colors.primary : colors.surface}
            />
          )}
          <Text style={[styles.joinButtonText, community.isJoined && styles.joinedButtonText]}>
            {community.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {community.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={styles.statText}>{formatNumber(community.memberCount)} members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
          <Text style={styles.statText}>{formatNumber(community.postCount)} posts</Text>
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
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: 4,
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
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});
